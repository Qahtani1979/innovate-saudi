import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Compact Saudi/MoMAH context
const COMPACT_SAUDI_CONTEXT = `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities. Programs: Sakani, Wafi, Ejar.
Key systems: Balady Platform, Sakani Portal, ANSA, Mostadam.
Partners: KACST, SDAIA, MCIT, KAUST, KFUPM, Monsha'at.`;

// Risk-specific context
const RISK_CONTEXT = `Strategic Risk Categories for MoMAH:
- OPERATIONAL: Service delivery, infrastructure, IT systems, cybersecurity
- FINANCIAL: Budget constraints, revenue, PPP risks, economic factors
- POLITICAL: Regulatory changes, leadership transitions, policy shifts
- REPUTATIONAL: Public trust, media, citizen satisfaction
- TECHNICAL: Technology adoption, integration failures, data security
- ENVIRONMENTAL: Climate, sustainability compliance, Mostadam standards
- LEGAL: Compliance, contractual, licensing requirements
- STRATEGIC: Alignment with Vision 2030, market changes, competition

Saudi-Specific Risk Factors:
- Vision 2030 alignment requirements and KPIs
- Saudization and workforce nationalization
- Digital transformation mandates
- Housing target pressures (70% ownership)
- Municipal service quality expectations
- Inter-agency coordination challenges`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { context, language = 'en' } = await req.json();
    
    // Extract context from previous steps
    const planContext = context?.planData || {};
    const contextData = planContext.step1 || {};
    const visionData = planContext.step2 || {};
    const stakeholders = planContext.step3?.stakeholders || [];
    const pestel = planContext.step4?.pestel || {};
    const swot = planContext.step5?.swot || {};
    const scenarios = planContext.step6?.scenarios || [];
    
    // Get taxonomy data
    const riskCategories = context?.taxonomyData?.riskCategories || [
      { code: 'OPERATIONAL', name_en: 'Operational', name_ar: 'تشغيلي' },
      { code: 'FINANCIAL', name_en: 'Financial', name_ar: 'مالي' },
      { code: 'POLITICAL', name_en: 'Political', name_ar: 'سياسي' },
      { code: 'REPUTATIONAL', name_en: 'Reputational', name_ar: 'سمعة' },
      { code: 'TECHNICAL', name_en: 'Technical', name_ar: 'تقني' },
      { code: 'ENVIRONMENTAL', name_en: 'Environmental', name_ar: 'بيئي' },
      { code: 'LEGAL', name_en: 'Legal/Compliance', name_ar: 'قانوني' },
      { code: 'STRATEGIC', name_en: 'Strategic', name_ar: 'استراتيجي' }
    ];

    const categoryCodes = riskCategories.map((c: any) => c.code);

    // Build context summary
    const contextSummary = `
PLAN CONTEXT:
- Entity: ${contextData.entity_name_en || contextData.entity_name || 'Municipality/Entity'}
- Type: ${contextData.entity_type || 'municipality'}
- Scope: ${contextData.plan_scope || 'comprehensive'}
- Duration: ${contextData.duration_years || 5} years
- Vision: ${visionData.vision_en || visionData.vision || 'Not specified'}
- Key Pillars: ${(visionData.strategic_pillars || []).map((p: any) => p.title_en || p.name_en).slice(0, 3).join(', ')}

STAKEHOLDER COUNT: ${stakeholders.length} stakeholders identified

KEY THREATS (from SWOT):
${(swot.threats || []).slice(0, 5).map((t: any) => `- ${t.factor_en || t.description_en || t}`).join('\n')}

NEGATIVE PESTEL FACTORS:
${Object.entries(pestel).slice(0, 3).map(([cat, items]: [string, any]) => 
  (items || []).filter((i: any) => i.trend === 'declining').slice(0, 2).map((i: any) => `- [${cat}] ${i.factor_en}`).join('\n')
).filter(Boolean).join('\n')}

WORST CASE SCENARIO:
${scenarios.find((s: any) => s.scenario_type === 'worst_case')?.description_en || 'High uncertainty environment'}`;

    const prompt = `You are a strategic risk management expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${RISK_CONTEXT}

Based on the following strategic plan context, identify 6-8 key strategic risks with mitigation strategies:

${contextSummary}

AVAILABLE RISK CATEGORIES: ${categoryCodes.join(', ')}

Generate risks that:
1. Are specific to the entity's context and strategic objectives
2. Cover different categories (operational, financial, technical, etc.)
3. Include Saudi-specific risks (Vision 2030 alignment, Saudization, etc.)
4. Have realistic likelihood and impact assessments
5. Include actionable mitigation strategies
6. Consider innovation and technology adoption risks

For each risk:
- Provide bilingual titles and descriptions (English and Arabic)
- Assign appropriate category from available categories
- Assess likelihood and impact (low/medium/high)
- Propose specific mitigation strategies
- Define contingency plans
- Suggest risk owner role

Also recommend an overall risk appetite level based on the entity type and scope.`;

    console.log('[strategy-risk-generator] Generating risks for:', contextData.entity_name_en || 'entity');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a strategic risk management expert specializing in Saudi government entities and Vision 2030 alignment. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_risk_assessment',
            description: 'Generate comprehensive risk assessment for strategic plan',
            parameters: {
              type: 'object',
              properties: {
                risk_appetite: {
                  type: 'string',
                  enum: ['low', 'moderate', 'high'],
                  description: 'Recommended overall risk appetite level'
                },
                risk_appetite_rationale: {
                  type: 'string',
                  description: 'Brief explanation for recommended risk appetite'
                },
                risks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title_en: { type: 'string', description: 'Risk title in English' },
                      title_ar: { type: 'string', description: 'Risk title in Arabic' },
                      description_en: { type: 'string', description: 'Detailed risk description in English' },
                      description_ar: { type: 'string', description: 'Detailed risk description in Arabic' },
                      category: { 
                        type: 'string', 
                        enum: categoryCodes,
                        description: 'Risk category code'
                      },
                      likelihood: { 
                        type: 'string', 
                        enum: ['low', 'medium', 'high'],
                        description: 'Probability of risk occurring'
                      },
                      impact: { 
                        type: 'string', 
                        enum: ['low', 'medium', 'high'],
                        description: 'Potential impact if risk occurs'
                      },
                      mitigation_strategy_en: { type: 'string', description: 'Mitigation strategy in English' },
                      mitigation_strategy_ar: { type: 'string', description: 'Mitigation strategy in Arabic' },
                      contingency_plan_en: { type: 'string', description: 'Contingency plan in English' },
                      contingency_plan_ar: { type: 'string', description: 'Contingency plan in Arabic' },
                      owner: { type: 'string', description: 'Suggested risk owner role' },
                      status: {
                        type: 'string',
                        enum: ['identified', 'mitigating', 'resolved', 'accepted'],
                        description: 'Current risk status'
                      }
                    },
                    required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'category', 'likelihood', 'impact', 'mitigation_strategy_en', 'mitigation_strategy_ar', 'owner', 'status']
                  },
                  description: 'Array of 6-8 strategic risks'
                }
              },
              required: ['risk_appetite', 'risks']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_risk_assessment' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[strategy-risk-generator] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('[strategy-risk-generator] AI response received');

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No valid tool call response from AI');
    }

    const generatedData = JSON.parse(toolCall.function.arguments);

    // Calculate risk scores for each risk
    const scoreMap = { low: 1, medium: 2, high: 3 };
    const risksWithScores = (generatedData.risks || []).map((risk: any, index: number) => ({
      ...risk,
      id: `ai-risk-${Date.now()}-${index}`,
      risk_score: scoreMap[risk.likelihood as keyof typeof scoreMap] * scoreMap[risk.impact as keyof typeof scoreMap],
      contingency_plan_en: risk.contingency_plan_en || '',
      contingency_plan_ar: risk.contingency_plan_ar || ''
    }));

    const result = {
      risk_appetite: generatedData.risk_appetite || 'moderate',
      risk_appetite_rationale: generatedData.risk_appetite_rationale,
      risks: risksWithScores
    };

    console.log('[strategy-risk-generator] Generated', risksWithScores.length, 'risks');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[strategy-risk-generator] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
