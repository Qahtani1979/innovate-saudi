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
    const { 
      topic, 
      sector_id, 
      research_type,
      // New strategic fields
      strategic_plan_ids,
      strategic_objective_ids,
      living_lab_id,
      research_priorities
    } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Strategy Lab Research Generator: ${topic}`);

    let research_content = '';
    let key_findings: string[] = [];
    let recommendations: string[] = [];

    if (LOVABLE_API_KEY) {
      const prompt = `Generate a strategic research brief on: "${topic}"
      
      Research Type: ${research_type || 'general'}
      
      Please provide:
      1. Executive Summary (2-3 paragraphs)
      2. Key Findings (5 bullet points)
      3. Strategic Recommendations (5 bullet points)
      4. Implementation Considerations
      
      Focus on municipal innovation and government transformation context.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        research_content = data.choices?.[0]?.message?.content || '';
        
        // Extract key findings and recommendations from content
        const lines = research_content.split('\n');
        let inFindings = false;
        let inRecommendations = false;
        
        for (const line of lines) {
          if (line.toLowerCase().includes('key findings')) {
            inFindings = true;
            inRecommendations = false;
            continue;
          }
          if (line.toLowerCase().includes('recommendation')) {
            inFindings = false;
            inRecommendations = true;
            continue;
          }
          if (line.toLowerCase().includes('implementation')) {
            inRecommendations = false;
            continue;
          }
          
          if (inFindings && line.trim().startsWith('-')) {
            key_findings.push(line.trim().substring(1).trim());
          }
          if (inRecommendations && line.trim().startsWith('-')) {
            recommendations.push(line.trim().substring(1).trim());
          }
        }
      }
    }

    // Fallback content
    if (!research_content) {
      research_content = `Research brief on: ${topic}\n\nThis research explores key aspects of ${topic} in the context of municipal innovation.`;
      key_findings = ['Finding 1', 'Finding 2', 'Finding 3'];
      recommendations = ['Recommendation 1', 'Recommendation 2', 'Recommendation 3'];
    }

    // Save research with strategic alignment
    const { data: research, error } = await supabase
      .from('strategy_lab_research')
      .insert({
        topic,
        sector_id,
        research_type: research_type || 'general',
        content: research_content,
        key_findings,
        recommendations,
        status: 'draft',
        generated_at: new Date().toISOString(),
        // Strategic alignment fields
        strategic_plan_ids: strategic_plan_ids || [],
        strategic_objective_ids: strategic_objective_ids || [],
        living_lab_id: living_lab_id || null,
        research_priorities: research_priorities || []
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not save research:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      research_id: research?.id,
      topic,
      content: research_content,
      key_findings,
      recommendations
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-lab-research-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
