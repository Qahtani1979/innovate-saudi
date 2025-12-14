import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const LOVABLE_API_URL = "https://api.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      strategic_plan_id,
      vision_statement,
      municipality_context,
      sector_focus,
      pillar_count = 4
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan if ID provided
    let strategicPlanData = null;
    if (strategic_plan_id) {
      const { data } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', strategic_plan_id)
        .single();
      strategicPlanData = data;
    }

    const prompt = `You are a strategic planning expert for Saudi municipal governance aligned with Vision 2030.

Generate ${pillar_count} strategic pillars for a municipal innovation strategy.

Context:
- Vision Statement: ${vision_statement || strategicPlanData?.vision_en || 'Municipal innovation and digital transformation'}
- Municipality: ${municipality_context || 'Saudi municipality'}
- Sector Focus: ${sector_focus?.join(', ') || 'All municipal sectors'}
${strategicPlanData ? `- Strategic Plan: ${strategicPlanData.title_en}` : ''}

Requirements for each pillar:
1. Align with Saudi Vision 2030 (Vibrant Society, Thriving Economy, Ambitious Nation)
2. Be actionable and measurable
3. Cover distinct strategic areas without overlap
4. Include bilingual names (English and Arabic)

Generate pillars as JSON array with this structure:
{
  "pillars": [
    {
      "name_en": "English pillar name",
      "name_ar": "اسم الركيزة بالعربية",
      "description_en": "Detailed description of pillar scope and purpose",
      "description_ar": "وصف تفصيلي",
      "icon": "lucide icon name (Target, Users, Lightbulb, Building, Globe, Shield, Zap, Heart)",
      "color": "hex color code",
      "vision_2030_alignment": "Which V2030 pillar this aligns with",
      "priority_order": 1,
      "key_themes": ["theme1", "theme2", "theme3"],
      "success_indicators": ["indicator1", "indicator2"]
    }
  ]
}`;

    let pillars = [];

    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch(LOVABLE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            pillars = parsed.pillars || [];
          }
        }
      } catch (e) {
        console.error("AI generation error:", e);
      }
    }

    // Fallback pillars if AI fails
    if (pillars.length === 0) {
      pillars = [
        {
          name_en: "Digital Transformation",
          name_ar: "التحول الرقمي",
          description_en: "Modernize municipal services through digital innovation and smart city technologies",
          description_ar: "تحديث الخدمات البلدية من خلال الابتكار الرقمي وتقنيات المدن الذكية",
          icon: "Zap",
          color: "#3B82F6",
          vision_2030_alignment: "Ambitious Nation",
          priority_order: 1,
          key_themes: ["Smart Services", "Digital Infrastructure", "Data-Driven Decisions"],
          success_indicators: ["Digital service adoption rate", "Process automation percentage"]
        },
        {
          name_en: "Citizen Experience",
          name_ar: "تجربة المواطن",
          description_en: "Enhance quality of life through citizen-centric service delivery and engagement",
          description_ar: "تعزيز جودة الحياة من خلال تقديم الخدمات والمشاركة المرتكزة على المواطن",
          icon: "Heart",
          color: "#EF4444",
          vision_2030_alignment: "Vibrant Society",
          priority_order: 2,
          key_themes: ["Service Excellence", "Citizen Voice", "Accessibility"],
          success_indicators: ["Citizen satisfaction score", "Service response time"]
        },
        {
          name_en: "Economic Enablement",
          name_ar: "التمكين الاقتصادي",
          description_en: "Foster innovation ecosystem and economic diversification through strategic partnerships",
          description_ar: "تعزيز منظومة الابتكار والتنويع الاقتصادي من خلال الشراكات الاستراتيجية",
          icon: "Building",
          color: "#10B981",
          vision_2030_alignment: "Thriving Economy",
          priority_order: 3,
          key_themes: ["Startup Support", "Investment Attraction", "Job Creation"],
          success_indicators: ["New business registrations", "Innovation investment ROI"]
        },
        {
          name_en: "Sustainable Development",
          name_ar: "التنمية المستدامة",
          description_en: "Ensure environmental sustainability and resource efficiency in urban development",
          description_ar: "ضمان الاستدامة البيئية وكفاءة الموارد في التنمية الحضرية",
          icon: "Globe",
          color: "#8B5CF6",
          vision_2030_alignment: "Vibrant Society",
          priority_order: 4,
          key_themes: ["Green Innovation", "Resource Efficiency", "Climate Resilience"],
          success_indicators: ["Carbon footprint reduction", "Renewable energy adoption"]
        }
      ];
    }

    // Save pillars to strategic plan if ID provided
    if (strategic_plan_id && pillars.length > 0) {
      await supabase
        .from('strategic_plans')
        .update({ 
          pillars: pillars,
          pillars_generated_at: new Date().toISOString()
        })
        .eq('id', strategic_plan_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pillars,
        count: pillars.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
