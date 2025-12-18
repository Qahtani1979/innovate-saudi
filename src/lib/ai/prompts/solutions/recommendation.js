/**
 * Solution Recommendation Engine Prompts
 * @module solutions/recommendation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SOLUTION_RECOMMENDATION_SYSTEM_PROMPT = getSystemPrompt('solution_recommendation', `
You are a solution matching specialist for Saudi municipal innovation.
Your role is to recommend the best solutions for challenges and pilots.
Consider technical fit, implementation readiness, and local context.
`);

/**
 * Build solution recommendation prompt
 * @param {Object} params - Context and entity data
 * @returns {string} Formatted prompt
 */
export function buildSolutionRecommendationPrompt({ context, challenge, pilot }) {
  const entityInfo = context === 'challenge' 
    ? `Challenge: ${challenge?.title_en}\nDescription: ${challenge?.description_en}\nSector: ${challenge?.sector}`
    : `Pilot: ${pilot?.title_en}\nObjectives: ${pilot?.objectives?.join(', ')}\nSector: ${pilot?.sector}`;

  return `Recommend the best 5 solutions for this ${context} in BOTH English and Arabic:

${entityInfo}

For each solution provide:
1. Solution name (bilingual)
2. Match score (0-100)
3. Key benefits (bilingual)
4. Implementation considerations
5. Success probability`;
}

export const SOLUTION_RECOMMENDATION_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name_en: { type: "string" },
          name_ar: { type: "string" },
          match_score: { type: "number" },
          benefits_en: { type: "array", items: { type: "string" } },
          benefits_ar: { type: "array", items: { type: "string" } },
          considerations: { type: "string" },
          success_probability: { type: "number" }
        }
      }
    },
    context_summary: { type: "string" }
  }
};

export const SOLUTION_RECOMMENDATION_PROMPTS = {
  systemPrompt: SOLUTION_RECOMMENDATION_SYSTEM_PROMPT,
  buildPrompt: buildSolutionRecommendationPrompt,
  schema: SOLUTION_RECOMMENDATION_SCHEMA
};
