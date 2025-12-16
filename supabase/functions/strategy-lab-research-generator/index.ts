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
      strategic_plan_id,
      municipality_id,
      research_focus,
      target_population,
      prefilled_spec,
      save_to_db = false
    } = await req.json();
    
    console.log("Starting strategy-lab-research-generator:", { strategic_plan_id, save_to_db });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan
    let plan = null;
    if (strategic_plan_id) {
      const { data } = await supabase
        .from("strategic_plans")
        .select("*")
        .eq("id", strategic_plan_id)
        .single();
      plan = data;
    }

    let living_labs: Array<{
      name_en: string;
      name_ar: string;
      description_en: string;
      description_ar: string;
      research_focus: string[];
      target_outcomes: string[];
    }> = [];

    if (LOVABLE_API_KEY) {
      const prompt = `Generate 1-2 living lab concepts for municipal innovation.

STRATEGIC PLAN: ${plan?.name_en || prefilled_spec?.title_en || 'Municipal Innovation Strategy'}
VISION: ${plan?.vision_en || plan?.description_en || ''}
RESEARCH FOCUS: ${research_focus || 'General innovation'}
TARGET POPULATION: ${target_population || 'General citizens'}
${prefilled_spec ? `PREFILLED SPEC: ${JSON.stringify(prefilled_spec)}` : ''}

For each living lab concept, provide:
1. name_en & name_ar: Living lab name (bilingual)
2. description_en & description_ar: Description (bilingual, 2-3 sentences)
3. research_focus: Array of 3-4 research focus areas
4. target_outcomes: Array of 3-4 expected outcomes

Ensure living labs:
- Support citizen co-creation and participation
- Enable real-world testing of innovations
- Align with Vision 2030 and municipal goals`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert in living lab design for Saudi municipalities. Always respond with valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            living_labs = parsed.living_labs || [parsed.living_lab] || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback living lab
    if (living_labs.length === 0) {
      living_labs = [{
        name_en: prefilled_spec?.title_en || "Smart Neighborhood Lab",
        name_ar: prefilled_spec?.title_ar || "مختبر الحي الذكي",
        description_en: prefilled_spec?.description_en || "A citizen-centric living lab testing smart city solutions in a real neighborhood setting, enabling co-creation with residents.",
        description_ar: "مختبر حي يركز على المواطن لاختبار حلول المدن الذكية في بيئة حي حقيقية، مما يتيح الإبداع المشترك مع السكان.",
        research_focus: ["Smart mobility", "Energy efficiency", "Waste management", "Community engagement"],
        target_outcomes: ["Validated smart solutions", "Citizen feedback integration", "Scalable models", "Reduced environmental impact"]
      }];
    }

    // Save to database if requested
    const savedLabs = [];
    if (save_to_db) {
      for (const lab of living_labs) {
        const labData = {
          name_en: lab.name_en,
          name_ar: lab.name_ar,
          description_en: lab.description_en,
          description_ar: lab.description_ar,
          research_focus: lab.research_focus,
          target_outcomes: lab.target_outcomes,
          strategic_plan_ids: strategic_plan_id ? [strategic_plan_id] : [],
          municipality_id: municipality_id || null,
          status: 'proposed',
          is_strategy_derived: true
        };

        const { data: saved, error } = await supabase
          .from('living_labs')
          .insert(labData)
          .select()
          .single();

        if (error) {
          console.error("Failed to save living lab:", error);
        } else {
          savedLabs.push(saved);
          console.log("Living lab saved with ID:", saved.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      living_labs: save_to_db ? savedLabs : living_labs,
      id: savedLabs[0]?.id || null,
      saved: savedLabs.length > 0,
      strategic_plan_id
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
