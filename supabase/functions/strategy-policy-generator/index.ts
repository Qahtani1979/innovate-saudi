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
    const { strategic_context, policy_count } = await req.json();

    const prompt = `You are an expert policy advisor for Saudi municipal governance and innovation.

Generate ${policy_count || 3} policy recommendations based on:

STRATEGIC CONTEXT:
${strategic_context || 'Municipal innovation governance and regulatory framework'}

For each policy, provide:
1. name_en & name_ar: Policy name
2. type: Policy type (regulatory/operational/governance/incentive)
3. scope_en & scope_ar: What the policy covers
4. objectives: Array of policy objectives
5. stakeholders: Array of affected stakeholders
6. risk_level: low/medium/high
7. implementation_timeframe: Suggested timeframe

Ensure policies:
- Align with Saudi governance frameworks
- Support Vision 2030 objectives
- Are practical and implementable
- Consider stakeholder impact`;

    let policies = [];

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
            { role: "system", content: "You are an expert policy advisor for Saudi municipalities. Always respond with valid JSON." },
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
            policies = parsed.policies || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback policies
    if (policies.length === 0) {
      policies = [
        {
          name_en: "Open Innovation Framework",
          name_ar: "إطار الابتكار المفتوح",
          type: "governance",
          scope_en: "Guidelines for external innovation partnerships and collaborations",
          scope_ar: "إرشادات للشراكات والتعاون في مجال الابتكار الخارجي",
          objectives: [
            "Enable public-private innovation partnerships",
            "Establish IP sharing frameworks",
            "Define collaboration governance"
          ],
          stakeholders: ["Municipalities", "Technology Providers", "Research Institutions", "Startups"],
          risk_level: "Medium",
          implementation_timeframe: "6-12 months"
        },
        {
          name_en: "Digital Service Standards",
          name_ar: "معايير الخدمات الرقمية",
          type: "regulatory",
          scope_en: "Minimum standards for digital municipal service delivery",
          scope_ar: "الحد الأدنى من المعايير لتقديم الخدمات البلدية الرقمية",
          objectives: [
            "Ensure consistent digital experience",
            "Mandate accessibility compliance",
            "Define service level agreements"
          ],
          stakeholders: ["All Municipal Departments", "Citizens", "IT Vendors"],
          risk_level: "Low",
          implementation_timeframe: "3-6 months"
        },
        {
          name_en: "Innovation Incentive Program",
          name_ar: "برنامج حوافز الابتكار",
          type: "incentive",
          scope_en: "Rewards and recognition for municipal innovation contributions",
          scope_ar: "المكافآت والتقدير للمساهمات في الابتكار البلدي",
          objectives: [
            "Motivate employee innovation",
            "Recognize citizen contributions",
            "Incentivize partner collaboration"
          ],
          stakeholders: ["Municipal Employees", "Citizens", "Partners", "HR Department"],
          risk_level: "Low",
          implementation_timeframe: "3-4 months"
        }
      ].slice(0, policy_count || 3);
    }

    return new Response(JSON.stringify({ success: true, policies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-policy-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
