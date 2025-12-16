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
      strategic_context, 
      policy_count,
      strategic_plan_id,
      prefilled_spec,
      save_to_db = false
    } = await req.json();

    console.log("Starting strategy-policy-generator:", { strategic_plan_id, save_to_db });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `You are an expert policy advisor for Saudi municipal governance and innovation.

Generate ${policy_count || 1} policy recommendations based on:

STRATEGIC CONTEXT:
${strategic_context || prefilled_spec?.description_en || 'Municipal innovation governance and regulatory framework'}
${prefilled_spec ? `PREFILLED SPEC: ${JSON.stringify(prefilled_spec)}` : ''}

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
            policies = parsed.policies || [parsed.policy] || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback policy
    if (policies.length === 0) {
      policies = [{
        title_en: prefilled_spec?.title_en || "Open Innovation Framework",
        title_ar: prefilled_spec?.title_ar || "إطار الابتكار المفتوح",
        description_en: prefilled_spec?.description_en || "Guidelines for external innovation partnerships and collaborations",
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
      }];
    }

    // Save to database if requested (using policy_documents table)
    const savedPolicies = [];
    if (save_to_db) {
      for (const policy of policies) {
        const policyData = {
          title_en: policy.title_en,
          title_ar: policy.title_ar,
          description_en: policy.description_en,
          description_ar: policy.description_ar,
          document_type: policy.type || 'governance',
          scope: policy.scope,
          objectives: policy.objectives,
          stakeholders: policy.stakeholders,
          risk_level: policy.risk_level,
          implementation_timeframe: policy.implementation_timeframe,
          strategic_plan_ids: strategic_plan_id ? [strategic_plan_id] : [],
          status: 'draft',
          is_strategy_derived: true
        };

        const { data: saved, error } = await supabase
          .from('policy_documents')
          .insert(policyData)
          .select()
          .single();

        if (error) {
          console.error("Failed to save policy:", error);
        } else {
          savedPolicies.push(saved);
          console.log("Policy saved with ID:", saved.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      policies: save_to_db ? savedPolicies : policies,
      id: savedPolicies[0]?.id || null,
      saved: savedPolicies.length > 0
    }), {
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
