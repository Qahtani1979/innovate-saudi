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

For each policy, provide (MUST use these exact field names):
1. title_en & title_ar: Policy title/name (bilingual)
2. description_en & description_ar: Policy description (bilingual)
3. type: Policy type (regulatory/operational/governance/incentive)
4. scope: What the policy covers (single string)
5. objectives: Array of policy objectives (strings)
6. stakeholders: Array of affected stakeholders (strings)
7. risk_level: Low/Medium/High
8. implementation_timeframe: Suggested timeframe

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

    // Fallback policies - mapped to UI expected fields (title_en, description_en, scope)
    if (policies.length === 0) {
      policies = [
        {
          title_en: "Open Innovation Framework",
          title_ar: "إطار الابتكار المفتوح",
          description_en: "Guidelines for external innovation partnerships and collaborations",
          description_ar: "إرشادات للشراكات والتعاون في مجال الابتكار الخارجي",
          type: "governance",
          scope: "External partnerships and collaboration governance",
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
          title_en: "Digital Service Standards",
          title_ar: "معايير الخدمات الرقمية",
          description_en: "Minimum standards for digital municipal service delivery",
          description_ar: "الحد الأدنى من المعايير لتقديم الخدمات البلدية الرقمية",
          type: "regulatory",
          scope: "Digital municipal service delivery standards",
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
          title_en: "Innovation Incentive Program",
          title_ar: "برنامج حوافز الابتكار",
          description_en: "Rewards and recognition for municipal innovation contributions",
          description_ar: "المكافآت والتقدير للمساهمات في الابتكار البلدي",
          type: "incentive",
          scope: "Municipal innovation rewards and recognition",
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
