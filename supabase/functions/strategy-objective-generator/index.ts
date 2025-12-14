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
      pillar_id,
      pillar_name,
      vision_statement,
      objectives_per_pillar = 3,
      include_kpis = true
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan
    let strategicPlanData = null;
    let pillars = [];
    if (strategic_plan_id) {
      const { data } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', strategic_plan_id)
        .single();
      strategicPlanData = data;
      pillars = data?.pillars || [];
    }

    const targetPillars = pillar_id 
      ? pillars.filter((p: any) => p.id === pillar_id || p.name_en === pillar_name)
      : pillars;

    const prompt = `You are a strategic planning expert for Saudi municipal governance aligned with Vision 2030.

Generate SMART strategic objectives with KPIs for the following strategic plan.

Context:
- Strategic Plan: ${strategicPlanData?.title_en || 'Municipal Innovation Strategy'}
- Vision: ${vision_statement || strategicPlanData?.vision_en || 'Municipal innovation excellence'}
- Pillars: ${JSON.stringify(targetPillars.length > 0 ? targetPillars : [{ name_en: pillar_name || 'Innovation' }])}

Generate ${objectives_per_pillar} objectives per pillar following SMART criteria:
- Specific: Clear and unambiguous
- Measurable: Quantifiable with KPIs
- Achievable: Realistic given municipal context
- Relevant: Aligned with Vision 2030
- Time-bound: With clear timelines

Return JSON with this structure:
{
  "objectives": [
    {
      "pillar_name": "The pillar this objective belongs to",
      "id": "unique_objective_id",
      "name_en": "Objective name in English",
      "name_ar": "اسم الهدف بالعربية",
      "description_en": "Detailed objective description",
      "description_ar": "وصف تفصيلي للهدف",
      "target_year": 2026,
      "baseline_value": 0,
      "target_value": 100,
      "unit": "percentage or number or currency",
      "weight": 25,
      "status": "not_started",
      "kpis": [
        {
          "id": "kpi_unique_id",
          "name_en": "KPI name",
          "name_ar": "اسم المؤشر",
          "description_en": "What this KPI measures",
          "unit": "%",
          "baseline": 0,
          "target": 80,
          "frequency": "quarterly",
          "data_source": "Where data comes from",
          "formula": "How to calculate"
        }
      ],
      "milestones": [
        {
          "year": 2024,
          "quarter": "Q4",
          "target_value": 25,
          "description": "Milestone description"
        }
      ],
      "dependencies": [],
      "risks": ["potential risk 1", "potential risk 2"],
      "enablers": ["resource 1", "capability 2"]
    }
  ]
}`;

    let objectives = [];

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
            objectives = parsed.objectives || [];
          }
        }
      } catch (e) {
        console.error("AI generation error:", e);
      }
    }

    // Fallback objectives if AI fails
    if (objectives.length === 0) {
      const fallbackPillar = pillar_name || targetPillars[0]?.name_en || "Digital Transformation";
      objectives = [
        {
          pillar_name: fallbackPillar,
          id: `obj_${Date.now()}_1`,
          name_en: "Increase Digital Service Adoption",
          name_ar: "زيادة اعتماد الخدمات الرقمية",
          description_en: "Achieve 80% digital adoption rate for municipal services among citizens",
          description_ar: "تحقيق معدل اعتماد رقمي 80% للخدمات البلدية بين المواطنين",
          target_year: 2026,
          baseline_value: 35,
          target_value: 80,
          unit: "percentage",
          weight: 30,
          status: "not_started",
          kpis: [
            {
              id: `kpi_${Date.now()}_1`,
              name_en: "Digital Service Adoption Rate",
              name_ar: "معدل اعتماد الخدمات الرقمية",
              description_en: "Percentage of citizens using digital municipal services",
              unit: "%",
              baseline: 35,
              target: 80,
              frequency: "quarterly",
              data_source: "Digital services portal analytics",
              formula: "(Digital users / Total service users) × 100"
            }
          ],
          milestones: [
            { year: 2024, quarter: "Q4", target_value: 50, description: "Launch enhanced digital portal" },
            { year: 2025, quarter: "Q2", target_value: 65, description: "Mobile app deployment" },
            { year: 2026, quarter: "Q4", target_value: 80, description: "Full digital transformation" }
          ],
          dependencies: ["IT infrastructure upgrade", "Staff training"],
          risks: ["Digital literacy gaps", "Technical infrastructure limitations"],
          enablers: ["Cloud infrastructure", "Digital skills program"]
        },
        {
          pillar_name: fallbackPillar,
          id: `obj_${Date.now()}_2`,
          name_en: "Reduce Service Processing Time",
          name_ar: "تقليل وقت معالجة الخدمات",
          description_en: "Reduce average municipal service processing time by 50%",
          description_ar: "تقليل متوسط وقت معالجة الخدمات البلدية بنسبة 50%",
          target_year: 2025,
          baseline_value: 14,
          target_value: 7,
          unit: "days",
          weight: 25,
          status: "not_started",
          kpis: [
            {
              id: `kpi_${Date.now()}_2`,
              name_en: "Average Processing Time",
              name_ar: "متوسط وقت المعالجة",
              description_en: "Average days to complete a service request",
              unit: "days",
              baseline: 14,
              target: 7,
              frequency: "monthly",
              data_source: "Service management system",
              formula: "Sum of processing days / Number of completed requests"
            }
          ],
          milestones: [
            { year: 2024, quarter: "Q3", target_value: 10, description: "Process automation phase 1" },
            { year: 2025, quarter: "Q2", target_value: 7, description: "AI-assisted processing" }
          ],
          dependencies: ["Process redesign", "Automation tools"],
          risks: ["Change resistance", "Legacy system integration"],
          enablers: ["BPM platform", "RPA implementation"]
        },
        {
          pillar_name: fallbackPillar,
          id: `obj_${Date.now()}_3`,
          name_en: "Improve Citizen Satisfaction",
          name_ar: "تحسين رضا المواطنين",
          description_en: "Achieve 90% citizen satisfaction score for municipal services",
          description_ar: "تحقيق درجة رضا المواطنين 90% للخدمات البلدية",
          target_year: 2026,
          baseline_value: 72,
          target_value: 90,
          unit: "percentage",
          weight: 30,
          status: "not_started",
          kpis: [
            {
              id: `kpi_${Date.now()}_3`,
              name_en: "Citizen Satisfaction Score",
              name_ar: "درجة رضا المواطنين",
              description_en: "Overall satisfaction rating from citizen surveys",
              unit: "%",
              baseline: 72,
              target: 90,
              frequency: "quarterly",
              data_source: "Citizen satisfaction surveys",
              formula: "Average of satisfaction ratings × 100"
            }
          ],
          milestones: [
            { year: 2024, quarter: "Q4", target_value: 78, description: "Service standards implementation" },
            { year: 2025, quarter: "Q4", target_value: 85, description: "Continuous improvement program" },
            { year: 2026, quarter: "Q4", target_value: 90, description: "Excellence certification" }
          ],
          dependencies: ["Customer feedback system", "Staff training"],
          risks: ["Rising expectations", "Resource constraints"],
          enablers: ["CRM system", "Service excellence framework"]
        }
      ];
    }

    // Save objectives to strategic plan if ID provided
    if (strategic_plan_id && objectives.length > 0) {
      const existingObjectives = strategicPlanData?.objectives || [];
      const updatedObjectives = [...existingObjectives, ...objectives];
      
      await supabase
        .from('strategic_plans')
        .update({ 
          objectives: updatedObjectives,
          objectives_generated_at: new Date().toISOString()
        })
        .eq('id', strategic_plan_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        objectives,
        count: objectives.length
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
