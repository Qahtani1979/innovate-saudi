import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      strategic_plan_id, 
      objective_id,
      prefilled_spec,
      program_type,
      duration_years,
      budget_range,
      additional_context 
    } = await req.json();

    console.log("Starting strategy-program-generator with:", { strategic_plan_id, objective_id, program_type });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan context
    let planContext = null;
    if (strategic_plan_id) {
      const { data } = await supabase
        .from("strategic_plans")
        .select("*")
        .eq("id", strategic_plan_id)
        .single();
      planContext = data;
    }

    // Fetch objective context
    let objectiveContext = null;
    if (objective_id) {
      const { data } = await supabase
        .from("strategic_objectives")
        .select("*")
        .eq("id", objective_id)
        .single();
      objectiveContext = data;
    }

    const prompt = `You are an expert in designing government innovation programs for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

Design a comprehensive program for the following context:

STRATEGIC PLAN: ${planContext?.name_en || prefilled_spec?.title_en || 'Municipal Innovation Program'}
VISION: ${planContext?.vision_en || ''}
OBJECTIVE: ${objectiveContext?.name_en || prefilled_spec?.description_en || 'Enhance municipal innovation capacity'}

PROGRAM PARAMETERS:
- Type: ${program_type || 'innovation'}
- Duration: ${duration_years || 3} years
- Budget Range: ${budget_range || 'TBD'}
${additional_context ? `- Additional Context: ${additional_context}` : ''}
${prefilled_spec ? `- Prefilled Spec: ${JSON.stringify(prefilled_spec)}` : ''}

Generate a detailed program with:
1. name_en & name_ar: Program name (bilingual)
2. description_en & description_ar: Program description (bilingual)
3. program_type: Type of program (innovation, capacity_building, digital_transformation, etc.)
4. objectives: Array of 3-5 program-specific objectives
5. target_audience: Who this program serves
6. expected_outcomes: Array of expected outcomes/impacts
7. budget_estimate: Estimated total budget
8. kpis: Array of 4-6 key performance indicators
9. phases: Implementation phases with timelines
10. governance_structure: How the program will be governed
11. success_criteria: What defines program success
12. risks: Potential risks with mitigation strategies

Ensure the program is:
- Aligned with Saudi Vision 2030
- Scalable across municipalities
- Measurable with clear KPIs
- Sustainable beyond initial funding`;

    let program = null;

    if (LOVABLE_API_KEY) {
      const response = await fetch(LOVABLE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert program designer for Saudi government innovation initiatives. Always respond with valid JSON containing a 'program' object." },
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
            program = parsed.program || parsed;
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback program
    if (!program) {
      program = {
        name_en: prefilled_spec?.title_en || "Municipal Innovation Excellence Program",
        name_ar: prefilled_spec?.title_ar || "برنامج التميز في الابتكار البلدي",
        description_en: prefilled_spec?.description_en || `A comprehensive program to enhance innovation capacity across Saudi municipalities, aligned with ${planContext?.name_en || 'strategic objectives'}.`,
        description_ar: prefilled_spec?.description_ar || `برنامج شامل لتعزيز قدرات الابتكار في البلديات السعودية، بما يتوافق مع ${planContext?.name_ar || 'الأهداف الاستراتيجية'}.`,
        program_type: program_type || "innovation",
        objectives: [
          "Establish innovation labs in 10+ municipalities",
          "Train 500+ municipal staff on innovation methodologies",
          "Launch 50+ pilot projects addressing municipal challenges",
          "Create sustainable innovation ecosystem"
        ],
        target_audience: "Municipal staff, innovation teams, citizens, technology partners",
        expected_outcomes: [
          "Increased innovation capacity across municipalities",
          "Improved citizen services through technology adoption",
          "Cost savings through process optimization",
          "Enhanced collaboration between municipalities"
        ],
        budget_estimate: budget_range || "SAR 50-100 million",
        kpis: [
          { name: "Innovation Projects Launched", target: 50, unit: "projects" },
          { name: "Staff Trained", target: 500, unit: "people" },
          { name: "Citizen Satisfaction Improvement", target: 20, unit: "%" },
          { name: "Cost Savings Generated", target: 10, unit: "million SAR" },
          { name: "Municipalities Participating", target: 10, unit: "municipalities" }
        ],
        phases: [
          { name: "Foundation", duration: "6 months", activities: "Setup, team formation, baseline assessment" },
          { name: "Pilot", duration: "12 months", activities: "Launch pilots in 3 municipalities" },
          { name: "Scale", duration: "18 months", activities: "Expand to remaining municipalities" },
          { name: "Sustain", duration: "ongoing", activities: "Knowledge transfer, continuous improvement" }
        ],
        governance_structure: "Steering Committee + Program Management Office + Municipality Champions",
        success_criteria: "Achieve 80% of KPI targets within program duration",
        risks: [
          { risk: "Low municipal buy-in", mitigation: "Early engagement and change management" },
          { risk: "Budget constraints", mitigation: "Phased approach with quick wins" },
          { risk: "Technical challenges", mitigation: "Partner with established technology providers" }
        ]
      };
    }

    // Save to database if strategic_plan_id provided
    let savedProgram = null;
    if (strategic_plan_id) {
      const programData = {
        name_en: program.name_en,
        name_ar: program.name_ar,
        description_en: program.description_en,
        description_ar: program.description_ar,
        program_type: program.program_type || 'innovation',
        strategic_plan_ids: [strategic_plan_id],
        strategic_objective_ids: objective_id ? [objective_id] : [],
        status: 'draft',
        budget_estimate: program.budget_estimate,
        kpis: program.kpis,
        objectives: program.objectives,
        target_audience: program.target_audience,
        expected_outcomes: program.expected_outcomes,
        phases: program.phases,
        governance_structure: program.governance_structure,
        success_criteria: program.success_criteria,
        risks: program.risks
      };

      const { data: saved, error } = await supabase
        .from('programs')
        .insert(programData)
        .select()
        .single();

      if (error) {
        console.error("Failed to save program:", error);
      } else {
        savedProgram = saved;
        console.log("Program saved with ID:", saved.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      program,
      program_id: savedProgram?.id || null,
      saved: !!savedProgram
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-program-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
