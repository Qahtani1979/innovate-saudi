import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Saudi MoMAH Context for Environmental Analysis
const COMPACT_SAUDI_CONTEXT = `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities. Programs: Sakani, Wafi, Ejar, Mulkiya, REDF.
Innovation: KACST, SDAIA, MCIT. Platforms: Balady, Sakani, Mostadam.`;

const PESTEL_CONTEXT = `PESTEL Analysis Framework for Saudi Municipal/Housing Sector:

POLITICAL FACTORS:
- Vision 2030 transformation agenda and government commitment
- Municipal governance reforms and decentralization
- Public-private partnership frameworks
- International diplomatic relations affecting foreign investment
- Royal directives on housing and urban development
- Regulatory environment stability

ECONOMIC FACTORS:
- Oil price volatility and economic diversification efforts
- Real estate market dynamics and housing affordability
- Foreign direct investment in PropTech and construction
- GIGA projects impact (NEOM, Red Sea, Qiddiya, Diriyah Gate)
- SME ecosystem and Monsha'at support programs
- Currency stability and inflation rates

SOCIAL FACTORS:
- Demographic shifts (70% under 35, urbanization trends)
- Homeownership aspirations (70% target by 2030)
- Quality of life expectations and citizen satisfaction
- Cultural preservation in urban development
- Women's economic participation
- Entertainment and leisure sector growth

TECHNOLOGICAL FACTORS:
- Digital transformation (Balady, Sakani platforms)
- Smart city initiatives and IoT integration
- PropTech adoption (BIM, 3D printing, modular construction)
- AI/ML applications in municipal services
- Digital twins for urban planning
- Green building technologies (Mostadam certification)

ENVIRONMENTAL FACTORS:
- Climate change adaptation (extreme heat, water scarcity)
- Sustainability mandates and green building codes
- Waste management and circular economy
- Renewable energy integration in buildings
- Air quality and urban greening initiatives
- Coastal and desert ecosystem protection

LEGAL FACTORS:
- Saudi Building Code compliance
- Property registration and title systems
- Labor law reforms (Saudization requirements)
- Consumer protection in real estate
- Environmental regulations
- Municipal licensing and permit requirements`;

const INNOVATION_EMPHASIS = `Innovation & Technology Integration:
- Technologies: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Partners: KACST, SDAIA, KAUST, KFUPM, Monsha'at, Badir Program
- PropTech: BIM, modular construction, 3D printing, smart homes
- Green Building: Mostadam certification, energy efficiency, sustainability`;

// Schema for PESTEL factor - matches UI expectations exactly
const pestelFactorSchema = {
  type: "object",
  properties: {
    factor_en: { type: "string", description: "Factor name/title in English" },
    factor_ar: { type: "string", description: "Factor name/title in Arabic" },
    impact: { type: "string", enum: ["high", "medium", "low"], description: "Impact level" },
    trend: { type: "string", enum: ["growing", "stable", "declining"], description: "Current trend direction" },
    timeframe: { type: "string", enum: ["short_term", "medium_term", "long_term"], description: "Timeframe for impact" },
    implications_en: { type: "string", description: "Strategic implications in English (1-2 sentences)" },
    implications_ar: { type: "string", description: "Strategic implications in Arabic (1-2 sentences)" }
  },
  required: ["factor_en", "factor_ar", "impact", "trend", "timeframe", "implications_en", "implications_ar"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategic_plan_id, context, language = 'en', taxonomyData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build taxonomy context if available
    let taxonomyContext = '';
    if (taxonomyData) {
      if (taxonomyData.sectors?.length) {
        taxonomyContext += `\nAvailable Sectors: ${taxonomyData.sectors.map((s: any) => s.name_en || s.name).join(', ')}`;
      }
      if (taxonomyData.regions?.length) {
        taxonomyContext += `\nSaudi Regions: ${taxonomyData.regions.map((r: any) => r.name_en || r.name).join(', ')}`;
      }
      if (taxonomyData.riskCategories?.length) {
        taxonomyContext += `\nRisk Categories: ${taxonomyData.riskCategories.map((r: any) => r.name_en || r.name).join(', ')}`;
      }
    }

    const systemPrompt = `You are a strategic planning expert specializing in environmental scanning and PESTEL analysis for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${PESTEL_CONTEXT}

${INNOVATION_EMPHASIS}
${taxonomyContext}

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY 4 factors for EACH of the 6 PESTEL categories (24 total factors)
2. Each factor MUST have ALL fields filled: factor_en, factor_ar, impact, trend, timeframe, implications_en, implications_ar
3. Use ONLY these exact values:
   - impact: "high", "medium", or "low"
   - trend: "growing", "stable", or "declining"  
   - timeframe: "short_term", "medium_term", or "long_term"
4. Provide meaningful Arabic translations for factor_ar and implications_ar
5. Be specific to Saudi municipal and housing sector context`;

    const userPrompt = `Based on the following strategic plan context, generate a comprehensive PESTEL analysis:

Plan Details:
${JSON.stringify(context, null, 2)}

Generate EXACTLY 4 factors for each category with ALL required fields:
- Political: Government policies, Vision 2030, municipal reforms
- Economic: Diversification, real estate, PPP, investment
- Social: Demographics, urbanization, citizen expectations
- Technological: Digital transformation, smart cities, AI/IoT
- Environmental: Sustainability, climate, green initiatives
- Legal: Regulations, compliance, building codes

IMPORTANT: Every factor must include factor_en, factor_ar, impact, trend, timeframe, implications_en, and implications_ar.`;

    console.log(`Generating PESTEL analysis for plan: ${strategic_plan_id}, language: ${language}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_pestel_analysis",
              description: "Generate a comprehensive PESTEL environmental analysis with bilingual content",
              parameters: {
                type: "object",
                properties: {
                  political: {
                    type: "array",
                    description: "Political factors (exactly 4)",
                    items: pestelFactorSchema
                  },
                  economic: {
                    type: "array",
                    description: "Economic factors (exactly 4)",
                    items: pestelFactorSchema
                  },
                  social: {
                    type: "array",
                    description: "Social factors (exactly 4)",
                    items: pestelFactorSchema
                  },
                  technological: {
                    type: "array",
                    description: "Technological factors (exactly 4)",
                    items: pestelFactorSchema
                  },
                  environmental: {
                    type: "array",
                    description: "Environmental factors (exactly 4)",
                    items: pestelFactorSchema
                  },
                  legal: {
                    type: "array",
                    description: "Legal factors (exactly 4)",
                    items: pestelFactorSchema
                  }
                },
                required: ["political", "economic", "social", "technological", "environmental", "legal"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_pestel_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("PESTEL analysis generated successfully");

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const pestelData = JSON.parse(toolCall.function.arguments);
      
      // Validate and ensure all fields are present
      const categories = ['political', 'economic', 'social', 'technological', 'environmental', 'legal'];
      for (const cat of categories) {
        if (!Array.isArray(pestelData[cat])) {
          pestelData[cat] = [];
        }
        // Ensure each factor has all required fields
        pestelData[cat] = pestelData[cat].map((factor: any, idx: number) => ({
          factor_en: factor.factor_en || factor.factor || `${cat} factor ${idx + 1}`,
          factor_ar: factor.factor_ar || '',
          impact: ['high', 'medium', 'low'].includes(factor.impact) ? factor.impact : 'medium',
          trend: ['growing', 'stable', 'declining'].includes(factor.trend) ? factor.trend : 'stable',
          timeframe: ['short_term', 'medium_term', 'long_term'].includes(factor.timeframe) ? factor.timeframe : 'medium_term',
          implications_en: factor.implications_en || factor.implications || '',
          implications_ar: factor.implications_ar || ''
        }));
      }
      
      return new Response(JSON.stringify({
        success: true,
        data: pestelData,
        strategic_plan_id,
        generated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to message content
    return new Response(JSON.stringify({
      success: true,
      data: aiResponse.choices?.[0]?.message?.content,
      strategic_plan_id,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in strategy-environmental-generator:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
