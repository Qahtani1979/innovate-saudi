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
      capability_needs, 
      partnership_types,
      prefilled_spec,
      save_to_db = false
    } = await req.json();

    console.log("Starting strategy-partnership-matcher:", { strategic_plan_id, save_to_db });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Fetch organizations
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name_en, name_ar, organization_type, expertise_areas, capabilities")
      .eq("is_deleted", false)
      .limit(50);

    const prompt = `You are an expert in strategic partnership matching for Saudi municipal innovation.

Analyze and recommend strategic partners based on:

STRATEGIC PLAN: ${plan?.name_en || prefilled_spec?.title_en || 'Municipal Innovation Strategy'}
OBJECTIVES: ${JSON.stringify(plan?.objectives || [])}

CAPABILITY NEEDS: ${capability_needs?.join(', ') || 'General innovation support'}
PREFERRED PARTNERSHIP TYPES: ${partnership_types?.join(', ') || 'Any'}
${prefilled_spec ? `PREFILLED SPEC: ${JSON.stringify(prefilled_spec)}` : ''}

AVAILABLE ORGANIZATIONS:
${(organizations || []).map((o: any) => `- ${o.name_en} (${o.organization_type}): ${o.expertise_areas?.join(', ') || 'General'}`).join('\n')}

For each recommended partner, provide:
1. organization_id: ID from the list above (or null if generic)
2. organization_name: Name
3. match_score: 0-100 based on alignment
4. capability_match: Array of matching capabilities
5. strategic_alignment: How they align with strategy
6. recommended_partnership_type: research/technology/implementation/funding/knowledge
7. suggested_activities: Array of 2-3 collaboration activities

Recommend top 1-3 partners with highest strategic fit.`;

    let recommendations = [];

    if (LOVABLE_API_KEY && organizations && organizations.length > 0) {
      const response = await fetch(LOVABLE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert partnership matcher for Saudi municipalities. Always respond with valid JSON." },
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
            recommendations = parsed.partner_recommendations || parsed.partnerships || [parsed.partnership] || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback recommendations
    if (recommendations.length === 0) {
      recommendations = [{
        organization_id: organizations?.[0]?.id || null,
        organization_name: prefilled_spec?.title_en || organizations?.[0]?.name_en || "Technology Innovation Partner",
        match_score: 85,
        capability_match: capability_needs?.slice(0, 2) || ['Digital Transformation', 'AI/ML'],
        strategic_alignment: "Provides technology capabilities to accelerate digital transformation initiatives.",
        recommended_partnership_type: partnership_types?.[0] || "technology",
        suggested_activities: ['Technology assessment', 'Proof of concept development', 'Training and capacity building']
      }];
    }

    // Save to database if requested
    const savedPartnerships = [];
    if (save_to_db) {
      for (const rec of recommendations) {
        const partnershipData = {
          title_en: `Partnership with ${rec.organization_name}`,
          title_ar: `شراكة مع ${rec.organization_name}`,
          description_en: rec.strategic_alignment,
          partner_organization_id: rec.organization_id,
          partner_name: rec.organization_name,
          partnership_type: rec.recommended_partnership_type,
          strategic_plan_ids: strategic_plan_id ? [strategic_plan_id] : [],
          match_score: rec.match_score,
          capability_areas: rec.capability_match,
          suggested_activities: rec.suggested_activities,
          status: 'proposed',
          is_strategy_derived: true
        };

        const { data: saved, error } = await supabase
          .from('partnerships')
          .insert(partnershipData)
          .select()
          .single();

        if (error) {
          console.error("Failed to save partnership:", error);
        } else {
          savedPartnerships.push(saved);
          console.log("Partnership saved with ID:", saved.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      partner_recommendations: save_to_db ? savedPartnerships : recommendations,
      id: savedPartnerships[0]?.id || null,
      saved: savedPartnerships.length > 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-partnership-matcher:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
