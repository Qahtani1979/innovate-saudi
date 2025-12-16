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
      objective_ids, 
      sector_id, 
      challenge_count, 
      additional_context,
      prefilled_spec,
      save_to_db = false 
    } = await req.json();

    console.log("Starting strategy-challenge-generator:", { strategic_plan_id, save_to_db });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan
    const { data: plan } = await supabase
      .from("strategic_plans")
      .select("*")
      .eq("id", strategic_plan_id)
      .single();

    // Fetch sector if provided
    let sectorInfo = null;
    if (sector_id) {
      const { data: sector } = await supabase
        .from("sectors")
        .select("name_en, name_ar")
        .eq("id", sector_id)
        .single();
      sectorInfo = sector;
    }

    const objectives = plan?.objectives || [];
    const selectedObjectives = objective_ids?.length > 0 
      ? objectives.filter((o: any, idx: number) => objective_ids.includes(o.id || idx))
      : objectives;

    const prompt = `You are an expert in municipal innovation and challenge design for Saudi Arabian municipalities.

Generate ${challenge_count || 1} innovation challenges based on the following strategic context:

STRATEGIC PLAN: ${plan?.name_en || prefilled_spec?.title_en || 'Municipal Innovation Strategy'}
VISION: ${plan?.vision_en || plan?.description_en || ''}

SELECTED OBJECTIVES:
${selectedObjectives.map((o: any) => `- ${o.title_en || o.name_en || o}`).join('\n')}

${sectorInfo ? `SECTOR FOCUS: ${sectorInfo.name_en}` : ''}
${additional_context ? `ADDITIONAL CONTEXT: ${additional_context}` : ''}
${prefilled_spec ? `PREFILLED SPEC: ${JSON.stringify(prefilled_spec)}` : ''}

For each challenge, provide:
1. title_en & title_ar: Clear, action-oriented title
2. description_en & description_ar: 2-3 sentences describing the challenge
3. problem_statement_en & problem_statement_ar: Root cause analysis
4. desired_outcome_en & desired_outcome_ar: What success looks like

Ensure challenges are:
- Specific and measurable
- Aligned with Vision 2030 and municipal innovation goals
- Actionable within 6-18 months
- Relevant to citizen needs`;

    let challenges = [];

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
            { role: "system", content: "You are an expert innovation challenge designer for Saudi municipalities. Always respond with valid JSON." },
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
            challenges = parsed.challenges || [parsed.challenge] || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback challenge
    if (challenges.length === 0) {
      challenges = [{
        title_en: prefilled_spec?.title_en || "Digital Service Accessibility Gap",
        title_ar: prefilled_spec?.title_ar || "فجوة إمكانية الوصول للخدمات الرقمية",
        description_en: prefilled_spec?.description_en || "Many residents face barriers accessing digital municipal services due to lack of digital literacy or infrastructure.",
        description_ar: "يواجه العديد من السكان عوائق في الوصول إلى الخدمات البلدية الرقمية بسبب نقص المعرفة الرقمية أو البنية التحتية.",
        problem_statement_en: "Digital divide prevents equal access to municipal services, leaving vulnerable populations underserved.",
        problem_statement_ar: "تمنع الفجوة الرقمية الوصول المتساوي إلى الخدمات البلدية، مما يترك الفئات الضعيفة دون خدمات كافية.",
        desired_outcome_en: "100% of residents can access essential municipal services through multiple channels.",
        desired_outcome_ar: "يمكن لجميع السكان الوصول إلى الخدمات البلدية الأساسية عبر قنوات متعددة."
      }];
    }

    // Save to database if requested
    const savedChallenges = [];
    if (save_to_db && strategic_plan_id) {
      for (const challenge of challenges) {
        const challengeData = {
          title_en: challenge.title_en,
          title_ar: challenge.title_ar,
          description_en: challenge.description_en,
          description_ar: challenge.description_ar,
          problem_statement_en: challenge.problem_statement_en,
          problem_statement_ar: challenge.problem_statement_ar,
          desired_outcome_en: challenge.desired_outcome_en,
          desired_outcome_ar: challenge.desired_outcome_ar,
          strategic_plan_ids: [strategic_plan_id],
          sector_id: sector_id || null,
          status: 'draft',
          is_strategy_derived: true,
          strategy_derivation_date: new Date().toISOString(),
          source: 'ai_generated'
        };

        const { data: saved, error } = await supabase
          .from('challenges')
          .insert(challengeData)
          .select()
          .single();

        if (error) {
          console.error("Failed to save challenge:", error);
        } else {
          savedChallenges.push(saved);
          console.log("Challenge saved with ID:", saved.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      challenges: save_to_db ? savedChallenges : challenges,
      id: savedChallenges[0]?.id || null,
      saved: savedChallenges.length > 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-challenge-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
