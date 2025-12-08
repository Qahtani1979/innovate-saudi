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
    const { program_id, strategic_goals, sector_focus } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating program themes for program: ${program_id}`);

    let themes: Array<{
      name: string;
      description: string;
      objectives: string[];
      target_outcomes: string[];
    }> = [];

    if (LOVABLE_API_KEY) {
      const prompt = `Generate 3-5 strategic program themes for an innovation program.
      
      Strategic Goals: ${JSON.stringify(strategic_goals || [])}
      Sector Focus: ${sector_focus || 'general'}
      
      For each theme provide:
      - Theme Name
      - Description (2-3 sentences)
      - Key Objectives (3 bullet points)
      - Target Outcomes (3 bullet points)
      
      Format as JSON array.`;

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
        const content = data.choices?.[0]?.message?.content || '';
        
        // Try to parse JSON from response
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            themes = JSON.parse(jsonMatch[0]);
          }
        } catch {
          console.warn('Could not parse themes JSON');
        }
      }
    }

    // Fallback themes
    if (themes.length === 0) {
      themes = [
        {
          name: 'Digital Transformation',
          description: 'Accelerating digital adoption across municipal services.',
          objectives: ['Modernize legacy systems', 'Improve citizen access', 'Enhance efficiency'],
          target_outcomes: ['50% digital service adoption', 'Reduced processing time', 'Cost savings']
        },
        {
          name: 'Sustainable Innovation',
          description: 'Promoting environmentally conscious innovation solutions.',
          objectives: ['Reduce carbon footprint', 'Promote green tech', 'Support circular economy'],
          target_outcomes: ['Carbon reduction targets', 'Green procurement increase', 'Waste reduction']
        },
        {
          name: 'Citizen Engagement',
          description: 'Enhancing citizen participation in municipal innovation.',
          objectives: ['Increase participation', 'Improve feedback loops', 'Build trust'],
          target_outcomes: ['Higher engagement rates', 'Faster response times', 'Improved satisfaction']
        }
      ];
    }

    // Save themes to program
    if (program_id) {
      await supabase
        .from('programs')
        .update({ 
          themes,
          themes_generated_at: new Date().toISOString()
        })
        .eq('id', program_id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      program_id,
      themes,
      theme_count: themes.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-program-theme-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
