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
      target_population
    } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating living lab concepts for plan: ${strategic_plan_id}`);

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
      const prompt = `Generate 2-3 living lab concepts for municipal innovation.

STRATEGIC PLAN: ${plan?.name_en || 'Municipal Innovation Strategy'}
VISION: ${plan?.vision_en || plan?.description_en || ''}
RESEARCH FOCUS: ${research_focus || 'General innovation'}
TARGET POPULATION: ${target_population || 'General citizens'}

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
            living_labs = parsed.living_labs || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback living labs
    if (living_labs.length === 0) {
      living_labs = [
        {
          name_en: "Smart Neighborhood Lab",
          name_ar: "مختبر الحي الذكي",
          description_en: "A citizen-centric living lab testing smart city solutions in a real neighborhood setting, enabling co-creation with residents.",
          description_ar: "مختبر حي يركز على المواطن لاختبار حلول المدن الذكية في بيئة حي حقيقية، مما يتيح الإبداع المشترك مع السكان.",
          research_focus: ["Smart mobility", "Energy efficiency", "Waste management", "Community engagement"],
          target_outcomes: ["Validated smart solutions", "Citizen feedback integration", "Scalable models", "Reduced environmental impact"]
        },
        {
          name_en: "Digital Services Innovation Lab",
          name_ar: "مختبر ابتكار الخدمات الرقمية",
          description_en: "A testing ground for digital municipal services with direct citizen participation in design and evaluation.",
          description_ar: "أرض اختبار للخدمات البلدية الرقمية مع مشاركة مباشرة للمواطنين في التصميم والتقييم.",
          research_focus: ["User experience", "Service accessibility", "Process automation", "Digital inclusion"],
          target_outcomes: ["Improved service satisfaction", "Reduced processing times", "Higher adoption rates", "Inclusive design"]
        },
        {
          name_en: "Sustainable Urban Lab",
          name_ar: "مختبر الاستدامة الحضرية",
          description_en: "An innovation space focused on environmental sustainability solutions with community participation.",
          description_ar: "مساحة ابتكار تركز على حلول الاستدامة البيئية مع مشاركة المجتمع.",
          research_focus: ["Green infrastructure", "Circular economy", "Urban farming", "Water conservation"],
          target_outcomes: ["Carbon footprint reduction", "Community ownership", "Replicable practices", "Environmental awareness"]
        }
      ];
    }

    return new Response(JSON.stringify({ 
      success: true,
      living_labs,
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
