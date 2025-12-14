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
    const { strategic_context, campaign_count } = await req.json();

    const prompt = `You are an expert marketing strategist for Saudi municipal innovation initiatives.

Generate ${campaign_count || 3} marketing campaign concepts based on:

STRATEGIC CONTEXT:
${strategic_context || 'Municipal innovation and digital transformation'}

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
            campaigns = parsed.campaigns || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback campaigns
    if (campaigns.length === 0) {
      campaigns = [
        {
          name_en: "Smart City, Better Life",
          name_ar: "مدينة ذكية، حياة أفضل",
          objective_en: "Increase citizen awareness of digital municipal services",
          objective_ar: "زيادة وعي المواطنين بالخدمات البلدية الرقمية",
          target_audience_en: "Residents aged 25-55, tech-savvy citizens",
          target_audience_ar: "السكان من 25-55 سنة، المواطنين المتمرسين تقنياً",
          duration: "3 months",
          channels: ["Social Media", "SMS", "Municipal App", "Community Centers"],
          kpis: ["Reach: 100,000 citizens", "Engagement Rate: 15%", "App Downloads: +30%"]
        },
        {
          name_en: "Innovation Champions",
          name_ar: "أبطال الابتكار",
          objective_en: "Encourage citizen participation in innovation initiatives",
          objective_ar: "تشجيع مشاركة المواطنين في مبادرات الابتكار",
          target_audience_en: "Young professionals, entrepreneurs, university students",
          target_audience_ar: "المهنيون الشباب، رواد الأعمال، طلاب الجامعات",
          duration: "6 months",
          channels: ["Universities", "Co-working Spaces", "Digital Ads", "Influencer Partnerships"],
          kpis: ["Challenge Submissions: 500+", "Youth Engagement: 40%", "Media Mentions: 50+"]
        },
        {
          name_en: "Sustainable Future Together",
          name_ar: "مستقبل مستدام معاً",
          objective_en: "Promote environmental innovation and sustainability",
          objective_ar: "تعزيز الابتكار البيئي والاستدامة",
          target_audience_en: "Families, schools, environmental organizations",
          target_audience_ar: "الأسر، المدارس، المنظمات البيئية",
          duration: "4 months",
          channels: ["Schools", "Environmental Events", "Outdoor Advertising", "Community Programs"],
          kpis: ["Recycling Adoption: +25%", "School Participation: 100 schools", "Carbon Awareness: 80%"]
        }
      ].slice(0, campaign_count || 3);
    }

    return new Response(JSON.stringify({ success: true, campaigns }), {
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
