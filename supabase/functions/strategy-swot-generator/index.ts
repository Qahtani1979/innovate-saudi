import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Compact Saudi context for prompts
const COMPACT_SAUDI_CONTEXT = `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities, 17 Amanats. Programs: Sakani, Wafi, Ejar, REDF.
Innovation: KACST, SDAIA, MCIT, Monsha'at, Badir. Platforms: Balady, Sakani, Mostadam.
Technologies: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, BIM.`;

const SWOT_ANALYSIS_CONTEXT = `SWOT Analysis for Saudi Municipal Strategic Planning:

INTERNAL FACTORS (Strengths & Weaknesses):
- Organizational capabilities and resources
- Technology infrastructure and digital maturity
- Human capital and talent pool
- Financial position and budget allocation
- Governance structures and decision-making processes
- Existing systems (Balady, Sakani, ANSA)
- Innovation culture and R&D capacity

EXTERNAL FACTORS (Opportunities & Threats):
- Vision 2030 alignment and government support
- Technology trends (AI, IoT, Smart Cities)
- Regulatory environment (PDPL, building codes)
- Economic conditions and funding availability
- Stakeholder expectations (citizens, businesses)
- Regional and international best practices
- Competitive landscape and partnerships`;

const INNOVATION_EMPHASIS = `CRITICAL: Include innovation/R&D focus in SWOT analysis:
- Strengths: R&D partnerships, pilot programs, tech talent, innovation culture
- Weaknesses: Skill gaps, legacy systems, innovation barriers, R&D budget constraints
- Opportunities: Emerging tech, KACST/SDAIA partnerships, smart city initiatives
- Threats: Tech obsolescence, talent drain, rapid change, cybersecurity risks`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategic_plan_id, context, language = 'en', taxonomy } = await req.json();
    
    console.log(`Generating SWOT analysis for plan: ${strategic_plan_id}, language: ${language}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build taxonomy context from provided data
    const taxonomyContext = taxonomy ? `
=== TAXONOMY DATA (USE THESE EXACT VALUES) ===
Sectors: ${(taxonomy.sectors || []).map((s: any) => s.code || s.name_en).join(', ') || 'URBAN_PLANNING, HOUSING, INFRASTRUCTURE, DIGITAL_SERVICES'}
Strategic Themes: ${(taxonomy.strategicThemes || []).map((t: any) => t.code || t.name_en).join(', ') || 'DIGITAL_TRANSFORMATION, SUSTAINABILITY, CITIZEN_EXPERIENCE'}
Technologies: ${(taxonomy.technologies || []).map((t: any) => t.code || t.name_en).join(', ') || 'AI_ML, IOT, DIGITAL_TWINS, BLOCKCHAIN'}
Vision Programs: ${(taxonomy.visionPrograms || []).map((p: any) => p.code || p.name_en).join(', ') || 'QUALITY_OF_LIFE, HOUSING, NTP'}
Risk Categories: ${(taxonomy.riskCategories || []).map((r: any) => r.code || r.name_en).join(', ') || 'STRATEGIC, OPERATIONAL, FINANCIAL, TECHNOLOGY'}
` : '';

    const systemPrompt = `You are a strategic planning expert specializing in SWOT analysis for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${SWOT_ANALYSIS_CONTEXT}

${INNOVATION_EMPHASIS}

${taxonomyContext}

CRITICAL REQUIREMENTS:
1. Generate bilingual content (English and Arabic) for ALL items
2. Use formal Arabic (فصحى) appropriate for government documents
3. Each item MUST have text_en, text_ar, and priority fields
4. Include innovation/R&D factors in each category
5. Be specific to the plan context, sectors, and technologies provided
6. Reference actual Saudi systems, agencies, and initiatives`;

    const userPrompt = `Generate a comprehensive SWOT analysis for this strategic plan:

=== PLAN CONTEXT ===
Plan Name: ${context.planName || 'Strategic Plan'}${context.planNameAr ? ` (${context.planNameAr})` : ''}
Vision: ${context.vision || 'Not yet defined'}${context.visionAr ? ` (${context.visionAr})` : ''}
Mission: ${context.mission || 'Not yet defined'}${context.missionAr ? ` (${context.missionAr})` : ''}
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

=== EXISTING ANALYSIS ===
Key Stakeholders: ${(context.stakeholders || []).slice(0, 5).map((s: any) => s.name_en || s).join(', ') || 'Not yet defined'}

---

## REQUIREMENTS:

Generate SWOT analysis with:
- **Strengths**: 5-7 internal positive factors (organizational capabilities, resources, competencies)
- **Weaknesses**: 5-7 internal negative factors (gaps, limitations, areas for improvement)
- **Opportunities**: 5-7 external positive factors (market trends, partnerships, policy support)
- **Threats**: 5-7 external negative factors (risks, competition, regulatory challenges)

For EACH item in ALL categories, provide:
- text_en: Clear description in English (1-2 sentences)
- text_ar: Arabic translation in formal Arabic (فصحى)
- priority: "high" | "medium" | "low"

### MANDATORY INNOVATION ITEMS:

**STRENGTHS (include at least 2 innovation-related):**
- R&D partnerships with KACST, SDAIA, universities
- Pilot program infrastructure and experimentation culture
- Digital platform capabilities (Balady, Sakani)
- Technical talent and digital certifications

**WEAKNESSES (include at least 2 innovation-related):**
- Legacy system integration challenges
- Skill gaps in emerging technologies
- Limited R&D budget allocation
- Innovation culture barriers

**OPPORTUNITIES (include at least 2 innovation-related):**
- SDAIA AI strategy and national AI center partnerships
- Smart city initiatives and IoT deployment programs
- Technology transfer from international partners
- PropTech/GovTech startup ecosystem

**THREATS (include at least 2 innovation-related):**
- Rapid technology obsolescence
- Cybersecurity and data privacy risks
- Tech talent competition with private sector
- Vendor lock-in and dependency risks

### PRIORITY DISTRIBUTION:
- High priority: 2-3 items per category (most impactful)
- Medium priority: 2-3 items per category
- Low priority: 1-2 items per category

Be specific to the plan context. Reference actual Saudi systems, agencies, and Vision 2030 programs.`;

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
            name: "generate_swot_analysis",
            description: "Generate a comprehensive SWOT analysis for strategic planning",
            parameters: {
              type: "object",
              required: ["strengths", "weaknesses", "opportunities", "threats"],
              properties: {
                strengths: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["text_en", "text_ar", "priority"],
                    properties: {
                      text_en: { type: "string", description: "Strength description in English" },
                      text_ar: { type: "string", description: "Strength description in Arabic" },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    }
                  },
                  description: "Internal positive factors - organizational capabilities and resources"
                },
                weaknesses: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["text_en", "text_ar", "priority"],
                    properties: {
                      text_en: { type: "string", description: "Weakness description in English" },
                      text_ar: { type: "string", description: "Weakness description in Arabic" },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    }
                  },
                  description: "Internal negative factors - gaps and limitations"
                },
                opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["text_en", "text_ar", "priority"],
                    properties: {
                      text_en: { type: "string", description: "Opportunity description in English" },
                      text_ar: { type: "string", description: "Opportunity description in Arabic" },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    }
                  },
                  description: "External positive factors - market trends and partnerships"
                },
                threats: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["text_en", "text_ar", "priority"],
                    properties: {
                      text_en: { type: "string", description: "Threat description in English" },
                      text_ar: { type: "string", description: "Threat description in Arabic" },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    }
                  },
                  description: "External negative factors - risks and challenges"
                }
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_swot_analysis" } }
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
    
    // Extract the function call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_swot_analysis") {
      throw new Error("Invalid response format from AI");
    }

    const swotData = JSON.parse(toolCall.function.arguments);
    
    // Validate and ensure all required fields
    const validateItems = (items: any[], category: string) => {
      return (items || []).map((item, i) => ({
        text_en: item.text_en || item.text || `${category} item ${i + 1}`,
        text_ar: item.text_ar || '',
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium'
      }));
    };

    const result = {
      strengths: validateItems(swotData.strengths, 'Strength'),
      weaknesses: validateItems(swotData.weaknesses, 'Weakness'),
      opportunities: validateItems(swotData.opportunities, 'Opportunity'),
      threats: validateItems(swotData.threats, 'Threat')
    };

    console.log("SWOT analysis generated successfully");
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in strategy-swot-generator:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
