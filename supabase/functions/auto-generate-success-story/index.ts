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
    const { entity_type, entity_id, metrics } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating success story for ${entity_type}: ${entity_id}`);

    // Fetch entity details
    const { data: entity } = await supabase
      .from(entity_type === 'pilot' ? 'pilots' : entity_type === 'solution' ? 'solutions' : 'programs')
      .select('*')
      .eq('id', entity_id)
      .single();

    if (!entity) {
      throw new Error(`Entity not found: ${entity_type} ${entity_id}`);
    }

    let story_content = '';

    if (LOVABLE_API_KEY) {
      // Use AI to generate story
      const prompt = `Generate a compelling success story for this ${entity_type}:
        Title: ${entity.title_en || entity.name_en}
        Description: ${entity.description_en || ''}
        Metrics: ${JSON.stringify(metrics || {})}
        
        Write a professional 2-3 paragraph success story highlighting achievements and impact.`;

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
        story_content = data.choices?.[0]?.message?.content || '';
      }
    }

    // Fallback template
    if (!story_content) {
      story_content = `${entity.title_en || entity.name_en} has achieved remarkable success. ${entity.description_en || 'This initiative has made significant impact in the community.'}`;
    }

    // Save the success story
    const { data: story, error } = await supabase
      .from('success_stories')
      .insert({
        entity_type,
        entity_id,
        title_en: `Success Story: ${entity.title_en || entity.name_en}`,
        content_en: story_content,
        metrics,
        status: 'draft',
        is_published: false
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      story_id: story?.id,
      content: story_content 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in auto-generate-success-story:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
