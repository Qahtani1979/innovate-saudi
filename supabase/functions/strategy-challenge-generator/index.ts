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
    const { strategic_plan_id, objective_ids, sector_id, challenge_count, additional_context } = await req.json();

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

Generate ${challenge_count || 3} innovation challenges based on the following strategic context:

STRATEGIC PLAN: ${plan?.name_en || 'Municipal Innovation Strategy'}
VISION: ${plan?.vision_en || plan?.description_en || ''}

SELECTED OBJECTIVES:
${selectedObjectives.map((o: any) => `- ${o.title_en || o.name_en || o}`).join('\n')}

${sectorInfo ? `SECTOR FOCUS: ${sectorInfo.name_en}` : ''}
${additional_context ? `ADDITIONAL CONTEXT: ${additional_context}` : ''}

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
            challenges = parsed.challenges || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback challenges
    if (challenges.length === 0) {
      challenges = [
        {
          title_en: "Digital Service Accessibility Gap",
          title_ar: "فجوة إمكانية الوصول للخدمات الرقمية",
          description_en: "Many residents face barriers accessing digital municipal services due to lack of digital literacy or infrastructure.",
          description_ar: "يواجه العديد من السكان عوائق في الوصول إلى الخدمات البلدية الرقمية بسبب نقص المعرفة الرقمية أو البنية التحتية.",
          problem_statement_en: "Digital divide prevents equal access to municipal services, leaving vulnerable populations underserved.",
          problem_statement_ar: "تمنع الفجوة الرقمية الوصول المتساوي إلى الخدمات البلدية، مما يترك الفئات الضعيفة دون خدمات كافية.",
          desired_outcome_en: "100% of residents can access essential municipal services through multiple channels.",
          desired_outcome_ar: "يمكن لجميع السكان الوصول إلى الخدمات البلدية الأساسية عبر قنوات متعددة."
        },
        {
          title_en: "Sustainable Waste Management Innovation",
          title_ar: "ابتكار الإدارة المستدامة للنفايات",
          description_en: "Current waste management practices do not meet sustainability goals and recycling targets.",
          description_ar: "ممارسات إدارة النفايات الحالية لا تلبي أهداف الاستدامة وأهداف إعادة التدوير.",
          problem_statement_en: "Low recycling rates and inefficient collection systems increase environmental impact and costs.",
          problem_statement_ar: "تزيد معدلات إعادة التدوير المنخفضة وأنظمة الجمع غير الفعالة من التأثير البيئي والتكاليف.",
          desired_outcome_en: "Achieve 50% waste diversion rate through smart collection and citizen engagement.",
          desired_outcome_ar: "تحقيق معدل تحويل نفايات بنسبة 50% من خلال الجمع الذكي ومشاركة المواطنين."
        },
        {
          title_en: "Smart Traffic Flow Optimization",
          title_ar: "تحسين تدفق المرور الذكي",
          description_en: "Traffic congestion reduces quality of life and increases commute times across the municipality.",
          description_ar: "يقلل الازدحام المروري من جودة الحياة ويزيد من أوقات التنقل عبر البلدية.",
          problem_statement_en: "Lack of real-time traffic management leads to inefficient road utilization and increased emissions.",
          problem_statement_ar: "يؤدي غياب إدارة المرور في الوقت الفعلي إلى استخدام غير فعال للطرق وزيادة الانبعاثات.",
          desired_outcome_en: "Reduce average commute time by 25% through AI-powered traffic management.",
          desired_outcome_ar: "تقليل متوسط وقت التنقل بنسبة 25% من خلال إدارة المرور المدعومة بالذكاء الاصطناعي."
        }
      ].slice(0, challenge_count || 3);
    }

    return new Response(JSON.stringify({ success: true, challenges }), {
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
