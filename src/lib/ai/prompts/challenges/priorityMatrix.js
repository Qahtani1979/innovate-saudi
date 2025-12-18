/**
 * Challenge Priority Matrix Prompts
 * @module challenges/priorityMatrix
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PRIORITY_MATRIX_SYSTEM_PROMPT = getSystemPrompt('priority_matrix', `
You are a challenge prioritization specialist for Saudi municipal innovation.
Your role is to score and rank challenges based on impact, urgency, feasibility, and strategic alignment.
Consider Vision 2030 priorities and municipal resource constraints.
`);

/**
 * Build priority matrix prompt
 * @param {Object} params - Challenge data
 * @returns {string} Formatted prompt
 */
export function buildPriorityMatrixPrompt({ challenges, criteria, municipalityContext }) {
  return `Analyze and prioritize these municipal challenges:

CHALLENGES:
${(challenges || []).map((c, i) => `${i + 1}. ${c.title_en || c.title}: ${c.description_en || c.description || ''}`).join('\n')}

MUNICIPALITY CONTEXT: ${municipalityContext || 'General Saudi municipality'}

CRITERIA WEIGHTS:
- Impact: ${criteria?.impact || 25}%
- Urgency: ${criteria?.urgency || 25}%
- Feasibility: ${criteria?.feasibility || 25}%
- Strategic Alignment: ${criteria?.alignment || 25}%

For each challenge, provide:
1. Score (0-100) for each criterion
2. Overall priority score
3. Recommended priority tier (critical/high/medium/low)
4. Justification for ranking`;
}

export const PRIORITY_MATRIX_SCHEMA = {
  type: "object",
  properties: {
    prioritized_challenges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_id: { type: "string" },
          impact_score: { type: "number" },
          urgency_score: { type: "number" },
          feasibility_score: { type: "number" },
          alignment_score: { type: "number" },
          overall_score: { type: "number" },
          priority_tier: { type: "string" },
          justification: { type: "string" }
        }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["prioritized_challenges"]
};

export const PRIORITY_MATRIX_PROMPTS = {
  systemPrompt: PRIORITY_MATRIX_SYSTEM_PROMPT,
  buildPrompt: buildPriorityMatrixPrompt,
  schema: PRIORITY_MATRIX_SCHEMA
};
