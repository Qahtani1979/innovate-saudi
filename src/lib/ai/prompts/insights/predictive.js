/**
 * Predictive Insights Prompt Module
 * Prompts for AI-powered forecasting and strategic intelligence
 * @module prompts/insights/predictive
 */

import { SAUDI_CONTEXT } from '@/lib/ai/prompts/common/saudiContext';

/**
 * Predictive insights generation prompt
 */
export const PREDICTIVE_INSIGHTS_PROMPT = {
  system: `You are an AI analyst specializing in predictive insights for Saudi municipal innovation platforms.
${SAUDI_CONTEXT.VISION_2030}

Provide strategic predictions that:
- Are data-driven and actionable
- Consider local Saudi context
- Identify emerging opportunities and risks
- Support proactive decision-making
- Are presented bilingually (English and Arabic)`,
  
  schema: {
    type: "object",
    properties: {
      emerging_challenges: {
        type: "array",
        items: {
          type: "object",
          properties: {
            en: { type: "string" },
            ar: { type: "string" }
          },
          required: ["en", "ar"]
        }
      },
      pilot_opportunities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            en: { type: "string" },
            ar: { type: "string" }
          },
          required: ["en", "ar"]
        }
      },
      breakthrough_sectors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            en: { type: "string" },
            ar: { type: "string" }
          },
          required: ["en", "ar"]
        }
      },
      risk_areas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            en: { type: "string" },
            ar: { type: "string" }
          },
          required: ["en", "ar"]
        }
      },
      scaling_opportunities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            en: { type: "string" },
            ar: { type: "string" }
          },
          required: ["en", "ar"]
        }
      }
    },
    required: ["emerging_challenges", "pilot_opportunities", "breakthrough_sectors"]
  }
};

/**
 * Template for predictive insights prompt
 */
export const PREDICTIVE_INSIGHTS_PROMPT_TEMPLATE = (context = {}) => ({
  ...PREDICTIVE_INSIGHTS_PROMPT,
  prompt: `Analyze the Saudi municipal innovation platform and provide strategic predictive insights in both English and Arabic:

Generate predictions for:
1. Emerging challenge areas (next 6 months)
2. High-potential pilot opportunities
3. Sectors likely to see breakthrough innovations
4. Risk areas requiring attention
5. Scaling opportunities

Context: ${context.sector || 'All sectors'}
Timeframe: ${context.timeframe || '6 months'}

Provide bilingual insights (both EN and AR for each item).`
});

export default {
  PREDICTIVE_INSIGHTS_PROMPT,
  PREDICTIVE_INSIGHTS_PROMPT_TEMPLATE
};
