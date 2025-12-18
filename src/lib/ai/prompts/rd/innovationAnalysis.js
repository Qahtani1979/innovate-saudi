/**
 * RD Innovation AI Prompts
 * Centralized prompts for R&D project innovation analysis
 * @module rd/innovationAnalysis
 */

export const RD_INNOVATION_SYSTEM_PROMPT = `You are an expert R&D analyst for Saudi Arabian government innovation initiatives.

ANALYSIS FRAMEWORK:
1. Innovation Assessment
   - Novelty evaluation
   - Technology readiness
   - Market potential
   - Competitive advantage

2. Research Quality
   - Methodology rigor
   - Data validity
   - Reproducibility
   - Impact potential

3. Commercialization Path
   - Market readiness
   - IP considerations
   - Partnership opportunities
   - Scaling strategy

4. Strategic Alignment
   - Vision 2030 contribution
   - Sector priorities
   - National capabilities
   - Knowledge transfer

CONTEXT:
- Saudi R&D ecosystem
- KACST guidelines
- Arabic/English bilingual support`;

export const RD_INNOVATION_SCHEMA = {
  type: "object",
  properties: {
    innovation_score: { type: "number" },
    trl_level: { type: "number", description: "Technology Readiness Level 1-9" },
    novelty_assessment: {
      type: "object",
      properties: {
        score: { type: "number" },
        unique_aspects: { type: "array", items: { type: "string" } },
        prior_art: { type: "array", items: { type: "string" } }
      }
    },
    commercialization_potential: {
      type: "object",
      properties: {
        score: { type: "number" },
        market_size: { type: "string" },
        time_to_market: { type: "string" },
        key_barriers: { type: "array", items: { type: "string" } }
      }
    },
    ip_recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          recommendation: { type: "string" },
          urgency: { type: "string" }
        }
      }
    },
    next_steps: { type: "array", items: { type: "string" } }
  },
  required: ["innovation_score", "trl_level", "novelty_assessment"]
};

export const buildRDInnovationPrompt = (projectData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze R&D project innovation:

PROJECT: ${projectData.name || 'Not specified'}
SECTOR: ${projectData.sector || 'Not specified'}
STATUS: ${projectData.status || 'Active'}

RESEARCH FOCUS:
${projectData.focus || 'Not specified'}

METHODOLOGY: ${projectData.methodology || 'Not specified'}

KEY OUTPUTS:
${projectData.outputs?.map(o => `- ${o}`).join('\n') || 'Not available'}

TEAM: ${projectData.teamSize || 0} researchers
BUDGET: ${projectData.budget || 'N/A'} SAR

Provide comprehensive innovation analysis with commercialization recommendations.`;
};

export const RD_INNOVATION_PROMPTS = {
  system: RD_INNOVATION_SYSTEM_PROMPT,
  schema: RD_INNOVATION_SCHEMA,
  buildPrompt: buildRDInnovationPrompt
};

export default RD_INNOVATION_PROMPTS;
