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

    const systemPrompt = language === 'ar' 
      ? `أنت خبير استراتيجي متخصص في تحليل البيئة الخارجية (PESTEL) لوزارة الشؤون البلدية والقروية والإسكان في المملكة العربية السعودية.
${COMPACT_SAUDI_CONTEXT}
${PESTEL_CONTEXT}
${INNOVATION_EMPHASIS}
${taxonomyContext}

قم بتحليل العوامل البيئية الخارجية بناءً على السياق المقدم وأنشئ تحليل PESTEL شامل.`
      : `You are a strategic planning expert specializing in environmental scanning and PESTEL analysis for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${PESTEL_CONTEXT}

${INNOVATION_EMPHASIS}
${taxonomyContext}

Analyze the external environment based on the provided context and generate a comprehensive PESTEL analysis with specific, actionable insights for the Saudi municipal and housing sector.`;

    const userPrompt = language === 'ar'
      ? `بناءً على السياق التالي، قم بإنشاء تحليل PESTEL شامل:

${JSON.stringify(context, null, 2)}

قم بإنشاء تحليل مفصل يتضمن:
1. العوامل السياسية (3-5 عوامل مع التأثير والتوصيات)
2. العوامل الاقتصادية (3-5 عوامل مع التأثير والتوصيات)
3. العوامل الاجتماعية (3-5 عوامل مع التأثير والتوصيات)
4. العوامل التقنية (3-5 عوامل مع التأثير والتوصيات)
5. العوامل البيئية (3-5 عوامل مع التأثير والتوصيات)
6. العوامل القانونية (3-5 عوامل مع التأثير والتوصيات)

لكل عامل، حدد:
- الوصف والأثر المحتمل
- مستوى التأثير (عالي/متوسط/منخفض)
- الإطار الزمني (قصير/متوسط/طويل المدى)
- التوصيات الاستراتيجية`
      : `Based on the following context, generate a comprehensive PESTEL analysis:

${JSON.stringify(context, null, 2)}

Generate a detailed analysis including:
1. Political Factors (3-5 factors with impact and recommendations)
2. Economic Factors (3-5 factors with impact and recommendations)
3. Social Factors (3-5 factors with impact and recommendations)
4. Technological Factors (3-5 factors with impact and recommendations)
5. Environmental Factors (3-5 factors with impact and recommendations)
6. Legal Factors (3-5 factors with impact and recommendations)

For each factor, specify:
- Description and potential impact
- Impact level (High/Medium/Low)
- Timeframe (Short/Medium/Long-term)
- Strategic recommendations

Focus on factors most relevant to the Saudi municipal and housing sector context.`;

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
              description: "Generate a comprehensive PESTEL environmental analysis",
              parameters: {
                type: "object",
                properties: {
                  political: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string", description: "Political factor name" },
                        description: { type: "string", description: "Detailed description" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        trend: { type: "string", enum: ["positive", "negative", "neutral"] },
                        timeframe: { type: "string", enum: ["short", "medium", "long"] },
                        implications: { type: "string", description: "Strategic implications" },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["factor", "description", "impact", "trend", "timeframe", "implications", "recommendations"]
                    }
                  },
                  economic: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        trend: { type: "string", enum: ["positive", "negative", "neutral"] },
                        timeframe: { type: "string", enum: ["short", "medium", "long"] },
                        implications: { type: "string" },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["factor", "description", "impact", "trend", "timeframe", "implications", "recommendations"]
                    }
                  },
                  social: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        trend: { type: "string", enum: ["positive", "negative", "neutral"] },
                        timeframe: { type: "string", enum: ["short", "medium", "long"] },
                        implications: { type: "string" },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["factor", "description", "impact", "trend", "timeframe", "implications", "recommendations"]
                    }
                  },
                  technological: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        trend: { type: "string", enum: ["positive", "negative", "neutral"] },
                        timeframe: { type: "string", enum: ["short", "medium", "long"] },
                        implications: { type: "string" },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["factor", "description", "impact", "trend", "timeframe", "implications", "recommendations"]
                    }
                  },
                  environmental: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        trend: { type: "string", enum: ["positive", "negative", "neutral"] },
                        timeframe: { type: "string", enum: ["short", "medium", "long"] },
                        implications: { type: "string" },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["factor", "description", "impact", "trend", "timeframe", "implications", "recommendations"]
                    }
                  },
                  legal: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        trend: { type: "string", enum: ["positive", "negative", "neutral"] },
                        timeframe: { type: "string", enum: ["short", "medium", "long"] },
                        implications: { type: "string" },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["factor", "description", "impact", "trend", "timeframe", "implications", "recommendations"]
                    }
                  },
                  summary: {
                    type: "object",
                    properties: {
                      key_opportunities: { type: "array", items: { type: "string" } },
                      key_threats: { type: "array", items: { type: "string" } },
                      critical_success_factors: { type: "array", items: { type: "string" } },
                      priority_actions: { type: "array", items: { type: "string" } }
                    },
                    required: ["key_opportunities", "key_threats", "critical_success_factors", "priority_actions"]
                  }
                },
                required: ["political", "economic", "social", "technological", "environmental", "legal", "summary"]
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
