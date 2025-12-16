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
      campaign_count,
      strategic_plan_id,
      prefilled_spec,
      save_to_db = false
    } = await req.json();

    console.log("Starting strategy-campaign-generator:", { strategic_plan_id, save_to_db });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `You are an expert marketing strategist for Saudi municipal innovation initiatives.

Generate ${campaign_count || 1} marketing campaign concepts based on:

STRATEGIC CONTEXT:
${strategic_context || prefilled_spec?.description_en || 'Municipal innovation and digital transformation'}
${prefilled_spec ? `PREFILLED SPEC: ${JSON.stringify(prefilled_spec)}` : ''}

For each campaign, provide:
1. name_en & name_ar: Campaign name
2. objective_en & objective_ar: Primary goal
3. target_audience_en & target_audience_ar: Who to reach
4. duration: Recommended duration
5. channels: Array of marketing channels
6. kpis: Array of key performance indicators

Ensure campaigns:
- Align with Vision 2030 communication guidelines
- Respect Saudi cultural values
- Use appropriate Arabic and English messaging
- Focus on measurable outcomes`;

    let campaigns = [];

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
            { role: "system", content: "You are an expert marketing strategist for Saudi municipalities. Always respond with valid JSON." },
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
            campaigns = parsed.campaigns || [parsed.campaign] || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback campaign
    if (campaigns.length === 0) {
      campaigns = [{
        name_en: prefilled_spec?.title_en || "Smart City, Better Life",
        name_ar: prefilled_spec?.title_ar || "مدينة ذكية، حياة أفضل",
        objective_en: "Increase citizen awareness of digital municipal services",
        objective_ar: "زيادة وعي المواطنين بالخدمات البلدية الرقمية",
        target_audience_en: "Residents aged 25-55, tech-savvy citizens",
        target_audience_ar: "السكان من 25-55 سنة، المواطنين المتمرسين تقنياً",
        duration: "3 months",
        channels: ["Social Media", "SMS", "Municipal App", "Community Centers"],
        kpis: ["Reach: 100,000 citizens", "Engagement Rate: 15%", "App Downloads: +30%"]
      }];
    }

    // Save to database if requested (using events table as proxy for campaigns)
    const savedCampaigns = [];
    if (save_to_db) {
      for (const campaign of campaigns) {
        // Save as event with campaign type
        const campaignData = {
          title_en: campaign.name_en,
          title_ar: campaign.name_ar,
          description_en: campaign.objective_en,
          description_ar: campaign.objective_ar,
          event_type: 'marketing_campaign',
          strategic_plan_ids: strategic_plan_id ? [strategic_plan_id] : [],
          target_audience: campaign.target_audience_en,
          channels: campaign.channels,
          kpis: campaign.kpis,
          duration: campaign.duration,
          status: 'draft',
          is_strategy_derived: true
        };

        const { data: saved, error } = await supabase
          .from('events')
          .insert(campaignData)
          .select()
          .single();

        if (error) {
          console.error("Failed to save campaign:", error);
        } else {
          savedCampaigns.push(saved);
          console.log("Campaign saved with ID:", saved.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      campaigns: save_to_db ? savedCampaigns : campaigns,
      id: savedCampaigns[0]?.id || null,
      saved: savedCampaigns.length > 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-campaign-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
