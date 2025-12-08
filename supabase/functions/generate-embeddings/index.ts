import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entity_type, entity_id, content, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Combine title and content for embedding
    const textToEmbed = [title, content].filter(Boolean).join('\n\n');
    
    if (!textToEmbed) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No content provided for embedding" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating embedding for ${entity_type}/${entity_id}`);

    // Use Lovable AI to generate a summary/keywords that can be used for matching
    // Note: For production, you'd want a proper embedding model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "Extract key concepts, themes, and searchable keywords from the text. Return as JSON with: keywords (array), themes (array), summary (string max 200 chars), sector_tags (array)." 
          },
          { role: "user", content: textToEmbed.substring(0, 5000) }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_metadata",
            description: "Extract searchable metadata from text",
            parameters: {
              type: "object",
              properties: {
                keywords: { type: "array", items: { type: "string" } },
                themes: { type: "array", items: { type: "string" } },
                summary: { type: "string" },
                sector_tags: { type: "array", items: { type: "string" } }
              },
              required: ["keywords", "themes", "summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_metadata" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error(`Embedding generation failed: ${response.status}`);
    }

    const data = await response.json();
    let metadata;
    
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        metadata = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      } catch {
        metadata = { keywords: [], themes: [], summary: textToEmbed.substring(0, 200) };
      }
    } else {
      metadata = { keywords: [], themes: [], summary: textToEmbed.substring(0, 200) };
    }

    console.log(`Embedding generated for ${entity_type}/${entity_id}:`, metadata.keywords?.length, "keywords");

    return new Response(JSON.stringify({ 
      success: true,
      entity_type,
      entity_id,
      ...metadata
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in generate-embeddings:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
