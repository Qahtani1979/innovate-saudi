import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPACT_SAUDI_CONTEXT = `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities, 17 Amanats. Programs: Sakani, Wafi, Ejar, REDF.
Innovation: KACST, SDAIA, MCIT, Monsha'at, Badir. Platforms: Balady, Sakani, Mostadam.
Technologies: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, BIM.`;

const SCENARIO_PLANNING_CONTEXT = `Strategic Scenario Planning for Saudi Municipal Context:

SCENARIO TYPES:
1. Best Case (Optimistic): Favorable conditions, accelerated progress, exceeded targets
2. Most Likely (Realistic): Based on current trends, balanced assumptions
3. Worst Case (Pessimistic): Challenging conditions, delayed progress, mitigating risks

KEY DRIVERS TO CONSIDER:
- Vision 2030 program acceleration/delays
- Budget availability and fiscal conditions
- Technology adoption and innovation success
- Stakeholder engagement and public support
- Regulatory environment changes
- Economic conditions (oil prices, diversification)
- Regional/global factors affecting Saudi Arabia`;

const INNOVATION_EMPHASIS = `CRITICAL: Include innovation/R&D factors in scenario planning:
- Best Case: Successful pilots, strong R&D partnerships, rapid tech adoption
- Most Likely: Steady innovation progress, moderate pilot success rates
- Worst Case: Pilot failures, technology obsolescence, partnership challenges`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategic_plan_id, context, language = 'en', taxonomy } = await req.json();
    
    console.log(`Generating scenarios for plan: ${strategic_plan_id}, language: ${language}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from existing analysis
    const swotContext = context.wizardData?.swot ? `
=== SWOT ANALYSIS (Use for scenario building) ===
Strengths: ${(context.wizardData.swot.strengths || []).slice(0, 4).map((s: any) => s.text_en).join('; ')}
Weaknesses: ${(context.wizardData.swot.weaknesses || []).slice(0, 4).map((w: any) => w.text_en).join('; ')}
Opportunities: ${(context.wizardData.swot.opportunities || []).slice(0, 4).map((o: any) => o.text_en).join('; ')}
Threats: ${(context.wizardData.swot.threats || []).slice(0, 4).map((t: any) => t.text_en).join('; ')}
` : '';

    const pestelContext = context.wizardData?.pestel ? `
=== PESTEL FACTORS (Consider in scenarios) ===
Political: ${(context.wizardData.pestel.political || []).slice(0, 2).map((p: any) => p.factor_en).join('; ')}
Economic: ${(context.wizardData.pestel.economic || []).slice(0, 2).map((e: any) => e.factor_en).join('; ')}
Technological: ${(context.wizardData.pestel.technological || []).slice(0, 2).map((t: any) => t.factor_en).join('; ')}
` : '';

    const systemPrompt = `You are a strategic planning expert specializing in scenario planning for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${SCENARIO_PLANNING_CONTEXT}

${INNOVATION_EMPHASIS}

CRITICAL REQUIREMENTS:
1. Generate bilingual content (English and Arabic) for ALL fields
2. Use formal Arabic (فصحى) appropriate for government documents
3. Each scenario must be internally consistent and plausible
4. Probabilities should sum to approximately 100%
5. Include innovation/R&D considerations in each scenario
6. Reference actual Saudi systems, agencies, and Vision 2030 programs`;

    const userPrompt = `Generate three strategic scenarios for this plan:

=== PLAN CONTEXT ===
Plan Name: ${context.planName || 'Strategic Plan'}${context.planNameAr ? ` (${context.planNameAr})` : ''}
Vision: ${context.vision || 'Not yet defined'}
Mission: ${context.mission || 'Not yet defined'}
Description: ${context.description || 'Not yet defined'}

=== STRATEGIC FOCUS ===
Target Sectors: ${(context.sectors || []).join(', ') || 'General municipal services'}
Strategic Themes: ${(context.themes || []).join(', ') || 'General improvement'}
Focus Technologies: ${(context.technologies || []).join(', ') || 'AI/ML, IoT, Smart Cities'}
Vision 2030 Programs: ${(context.vision2030Programs || []).join(', ') || 'Quality of Life, Housing'}
Target Regions: ${(context.regions || []).join(', ') || 'Kingdom-wide'}

=== TIMELINE & RESOURCES ===
Duration: ${context.startYear || new Date().getFullYear()} - ${context.endYear || new Date().getFullYear() + 5}
Budget Range: ${context.budgetRange || 'To be determined'}

=== DISCOVERY INPUTS ===
Key Challenges: ${context.keyChallenges || 'General municipal challenges'}
Available Resources: ${context.availableResources || 'Standard municipal resources'}
Initial Constraints: ${context.initialConstraints || 'Standard constraints'}

${swotContext}
${pestelContext}

---

## REQUIREMENTS:

Generate THREE scenarios: best_case, most_likely, worst_case

For EACH scenario, provide:
1. **description_en / description_ar**: 3-4 sentences describing the scenario narrative
2. **assumptions**: 4-5 key assumptions (each with text_en and text_ar)
3. **outcomes**: 4-5 expected outcomes (each with metric_en, metric_ar, value)
4. **probability**: Likelihood percentage (probabilities should sum to ~100%)

### BEST CASE SCENARIO (probability: 15-25%):
- Vision 2030 milestones exceeded ahead of schedule
- Strong stakeholder support and engagement
- Successful innovation pilots and technology adoption
- Adequate or surplus budget allocation
- Favorable regulatory environment

### MOST LIKELY SCENARIO (probability: 50-65%):
- Vision 2030 targets met with moderate challenges
- Balanced stakeholder engagement
- Mixed pilot results, steady tech adoption
- Budget constraints manageable
- Stable regulatory environment

### WORST CASE SCENARIO (probability: 15-25%):
- Vision 2030 delays and scope reductions
- Stakeholder resistance or disengagement
- Pilot failures and technology challenges
- Significant budget cuts or delays
- Regulatory hurdles or policy changes

### OUTCOME METRICS (use specific, measurable indicators):
- Citizen satisfaction scores (%)
- Service delivery time improvements (days/hours)
- Digital adoption rates (%)
- Housing units delivered (number)
- Pilot success rates (%)
- R&D investment levels (SAR or %)
- Smart city index improvements (points)
- Budget variance (%)

Be specific to the plan context. Use realistic Saudi municipal benchmarks.`;

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
        tools: [{
          type: "function",
          function: {
            name: "generate_scenarios",
            description: "Generate three strategic planning scenarios",
            parameters: {
              type: "object",
              required: ["best_case", "most_likely", "worst_case"],
              properties: {
                best_case: {
                  type: "object",
                  required: ["description_en", "description_ar", "assumptions", "outcomes", "probability"],
                  properties: {
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    assumptions: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["text_en", "text_ar"],
                        properties: {
                          text_en: { type: "string" },
                          text_ar: { type: "string" }
                        }
                      }
                    },
                    outcomes: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["metric_en", "metric_ar", "value"],
                        properties: {
                          metric_en: { type: "string" },
                          metric_ar: { type: "string" },
                          value: { type: "string" }
                        }
                      }
                    },
                    probability: { type: "number" }
                  }
                },
                most_likely: {
                  type: "object",
                  required: ["description_en", "description_ar", "assumptions", "outcomes", "probability"],
                  properties: {
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    assumptions: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["text_en", "text_ar"],
                        properties: {
                          text_en: { type: "string" },
                          text_ar: { type: "string" }
                        }
                      }
                    },
                    outcomes: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["metric_en", "metric_ar", "value"],
                        properties: {
                          metric_en: { type: "string" },
                          metric_ar: { type: "string" },
                          value: { type: "string" }
                        }
                      }
                    },
                    probability: { type: "number" }
                  }
                },
                worst_case: {
                  type: "object",
                  required: ["description_en", "description_ar", "assumptions", "outcomes", "probability"],
                  properties: {
                    description_en: { type: "string" },
                    description_ar: { type: "string" },
                    assumptions: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["text_en", "text_ar"],
                        properties: {
                          text_en: { type: "string" },
                          text_ar: { type: "string" }
                        }
                      }
                    },
                    outcomes: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["metric_en", "metric_ar", "value"],
                        properties: {
                          metric_en: { type: "string" },
                          metric_ar: { type: "string" },
                          value: { type: "string" }
                        }
                      }
                    },
                    probability: { type: "number" }
                  }
                }
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_scenarios" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_scenarios") {
      throw new Error("Invalid response format from AI");
    }

    const scenarioData = JSON.parse(toolCall.function.arguments);
    
    // Validate and normalize each scenario
    const normalizeScenario = (scenario: any, defaultProbability: number) => ({
      description_en: scenario?.description_en || '',
      description_ar: scenario?.description_ar || '',
      assumptions: (scenario?.assumptions || []).map((a: any) => ({
        text_en: a.text_en || a.text || '',
        text_ar: a.text_ar || ''
      })),
      outcomes: (scenario?.outcomes || []).map((o: any) => ({
        metric_en: o.metric_en || o.metric || '',
        metric_ar: o.metric_ar || '',
        value: String(o.value || '')
      })),
      probability: typeof scenario?.probability === 'number' ? scenario.probability : defaultProbability
    });

    const result = {
      best_case: normalizeScenario(scenarioData.best_case, 20),
      most_likely: normalizeScenario(scenarioData.most_likely, 60),
      worst_case: normalizeScenario(scenarioData.worst_case, 20)
    };

    console.log("Scenarios generated successfully");
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in strategy-scenario-generator:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
