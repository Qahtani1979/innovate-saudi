/**
 * Similar Policy Detector Prompts
 * @module policy/similarPolicy
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SIMILAR_POLICY_SYSTEM_PROMPT = getSystemPrompt('similar_policy', `
You are a policy analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to detect semantically similar policies to prevent duplication.
Analyze policy content, regulatory frameworks, and stakeholder impacts for similarity.
`);

/**
 * Build similar policy detection prompt
 * @param {Object} params - Policy data
 * @returns {string} Formatted prompt
 */
export function buildSimilarPolicyPrompt({ newPolicy, existingPolicies }) {
  const policiesList = existingPolicies?.slice(0, 50).map(p => `
ID: ${p.id}
Title AR: ${p.title_ar}
Title EN: ${p.title_en}
Recommendation AR: ${p.recommendation_text_ar?.substring(0, 200)}
Type: ${p.policy_type}
Framework: ${p.regulatory_framework}
`).join('\n---\n') || 'No existing policies';

  return `Analyze this new policy and find semantically similar policies from the database:

NEW POLICY:
Title AR: ${newPolicy.title_ar}
Recommendation AR: ${newPolicy.recommendation_text_ar}
Framework: ${newPolicy.regulatory_framework || 'N/A'}
Type: ${newPolicy.policy_type || 'N/A'}

EXISTING POLICIES DATABASE (${existingPolicies?.length || 0} policies):
${policiesList}

Return the IDs of the 3 most semantically similar policies with similarity scores (0-100). Consider:
- Subject matter overlap
- Regulatory framework similarity
- Policy type alignment
- Stakeholder impact similarity

Only return policies with >60% similarity.`;
}

export const SIMILAR_POLICY_SCHEMA = {
  type: 'object',
  properties: {
    similar_policies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          policy_id: { type: 'string' },
          similarity_score: { type: 'number', minimum: 0, maximum: 100 },
          reason: { type: 'string' }
        },
        required: ['policy_id', 'similarity_score', 'reason']
      }
    }
  },
  required: ['similar_policies']
};

export const SIMILAR_POLICY_PROMPTS = {
  systemPrompt: SIMILAR_POLICY_SYSTEM_PROMPT,
  buildPrompt: buildSimilarPolicyPrompt,
  schema: SIMILAR_POLICY_SCHEMA
};
