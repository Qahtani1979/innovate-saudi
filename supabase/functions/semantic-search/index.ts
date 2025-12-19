import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, entity_type, limit = 10, threshold = 0.5 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!query) {
      return new Response(JSON.stringify({ 
        success: false, 
        results: [],
        error: "No query provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Semantic search: "${query.substring(0, 50)}..." in ${entity_type || 'all'}`);

    // Extract keywords from query using AI
    const keywordResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Extract search keywords and related terms from the query. Include synonyms and related concepts. Return as JSON array of strings only." 
          },
          { role: "user", content: query }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_keywords",
            description: "Extract search keywords",
            parameters: {
              type: "object",
              properties: {
                keywords: { type: "array", items: { type: "string" } }
              },
              required: ["keywords"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_keywords" } }
      }),
    });

    let searchTerms: string[] = [query];
    
    if (keywordResponse.ok) {
      const data = await keywordResponse.json();
      if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
        try {
          const parsed = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
          searchTerms = [...searchTerms, ...(parsed.keywords || [])];
        } catch { /* use default */ }
      }
    }

    // Build search query for Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const results: Array<{ entity_type: string; entity_id: string; title: string; score: number; data: unknown }> = [];

    // Search across different entity types based on request
    const entitiesToSearch = entity_type ? [entity_type] : ['challenges', 'solutions', 'pilots', 'rd_projects'];
    
    for (const entityTable of entitiesToSearch) {
      const searchColumn = entityTable === 'solutions' ? 'name_en' : 'title_en';
      
      const { data: entityResults, error } = await supabase
        .from(entityTable)
        .select('id, ' + searchColumn + ', description_en, keywords, tags')
        .eq('is_deleted', false)
        .or(`${searchColumn}.ilike.%${query}%,description_en.ilike.%${query}%`)
        .limit(limit);
      
      if (!error && entityResults) {
        for (const item of entityResults as unknown as Record<string, unknown>[]) {
          // Calculate a simple relevance score
          const titleValue = String(item[searchColumn] || '');
          const descValue = String(item['description_en'] || '');
          const keywordsValue = (item['keywords'] as string[]) || [];
          
          const titleMatch = titleValue.toLowerCase().includes(query.toLowerCase()) ? 0.8 : 0;
          const descMatch = descValue.toLowerCase().includes(query.toLowerCase()) ? 0.4 : 0;
          const keywordMatch = keywordsValue.some((k: string) => 
            searchTerms.some(t => k.toLowerCase().includes(t.toLowerCase()))
          ) ? 0.3 : 0;
          
          const score = Math.min(1, titleMatch + descMatch + keywordMatch);
          
          if (score >= threshold) {
            results.push({
              entity_type: entityTable,
              entity_id: String(item['id']),
              title: titleValue,
              score,
              data: item
            });
          }
        }
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, limit);

    console.log(`Found ${topResults.length} results for semantic search`);

    return new Response(JSON.stringify({ 
      success: true,
      query,
      results: topResults
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in semantic-search:", error);
    return new Response(JSON.stringify({ success: false, results: [], error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
