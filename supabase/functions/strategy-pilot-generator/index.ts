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
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { challenge_id, solution_id, pilot_duration_months, target_participants, additional_context } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch challenge
    const { data: challenge } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", challenge_id)
      .single();

    // Fetch solution if provided
    let solution = null;
    if (solution_id) {
      const { data } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", solution_id)
        .single();
      solution = data;
    }

    const prompt = `You are an expert in pilot project design for Saudi municipal innovation initiatives.

Design 2-3 pilot project variants for the following context:

CHALLENGE: ${challenge?.title_en || 'Municipal Innovation Challenge'}
PROBLEM: ${challenge?.problem_statement_en || challenge?.description_en || ''}
DESIRED OUTCOME: ${challenge?.desired_outcome_en || ''}

${solution ? `PROPOSED SOLUTION: ${solution.name_en}\n${solution.description_en || ''}` : 'No specific solution selected - propose solution approaches.'}

PILOT PARAMETERS:
- Duration: ${pilot_duration_months || 3} months
- Target Participants: ${target_participants || 100}
${additional_context ? `- Additional Context: ${additional_context}` : ''}

For each pilot design, provide:
1. name_en & name_ar: Pilot project name
2. description_en & description_ar: Brief description
3. success_criteria: What defines success (measurable)
4. kpis: Array of 3-5 key performance indicators
5. risks: Array of potential risks with mitigation strategies
6. phases: Suggested implementation phases

Ensure pilots are:
- Testable within the given duration
- Scalable if successful
- Measurable with clear KPIs`;

    let pilots = [];

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
            { role: "system", content: "You are an expert pilot project designer for Saudi municipalities. Always respond with valid JSON." },
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
            pilots = parsed.pilots || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback pilots
    if (pilots.length === 0) {
      pilots = [
        {
          name_en: "Smart Solution Pilot - Phase 1",
          name_ar: "تجربة الحل الذكي - المرحلة 1",
          description_en: `A focused pilot to test solutions addressing "${challenge?.title_en || 'the identified challenge'}" with ${target_participants} participants over ${pilot_duration_months} months.`,
          description_ar: `تجربة مركزة لاختبار الحلول التي تعالج "${challenge?.title_ar || 'التحدي المحدد'}" مع ${target_participants} مشارك على مدى ${pilot_duration_months} أشهر.`,
          success_criteria: "Achieve 70% user satisfaction and 50% improvement in target metrics",
          kpis: [
            { name: "User Satisfaction Score", target: 70, unit: "%" },
            { name: "Adoption Rate", target: 60, unit: "%" },
            { name: "Problem Resolution Rate", target: 50, unit: "%" },
            { name: "Time to Resolution", target: 30, unit: "% reduction" }
          ],
          risks: [
            { risk: "Low user adoption", mitigation: "Intensive onboarding and support program" },
            { risk: "Technical integration issues", mitigation: "Thorough testing in sandbox environment" },
            { risk: "Scope creep", mitigation: "Strict change control process" }
          ],
          phases: ["Setup & Planning", "Implementation", "Testing", "Evaluation"]
        },
        {
          name_en: "Community-Driven Innovation Pilot",
          name_ar: "تجربة الابتكار المجتمعي",
          description_en: `An alternative approach focusing on community engagement and co-creation to address ${challenge?.title_en || 'the challenge'}.`,
          description_ar: `نهج بديل يركز على المشاركة المجتمعية والإبداع المشترك لمعالجة ${challenge?.title_ar || 'التحدي'}.`,
          success_criteria: "Engage 80% of target community and generate 3+ viable solutions",
          kpis: [
            { name: "Community Engagement", target: 80, unit: "%" },
            { name: "Ideas Generated", target: 20, unit: "ideas" },
            { name: "Solutions Validated", target: 3, unit: "solutions" },
            { name: "Stakeholder Satisfaction", target: 75, unit: "%" }
          ],
          risks: [
            { risk: "Low community participation", mitigation: "Multi-channel engagement strategy" },
            { risk: "Quality of input varies", mitigation: "Facilitated workshops with guidance" }
          ],
          phases: ["Community Mapping", "Engagement", "Co-creation", "Validation", "Reporting"]
        }
      ];
    }

    return new Response(JSON.stringify({ success: true, pilots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-pilot-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
