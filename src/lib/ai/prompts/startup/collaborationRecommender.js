/**
 * Startup Collaboration Recommender Prompts
 * @module startup/collaborationRecommender
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const COLLABORATION_RECOMMENDER_SYSTEM_PROMPT = getSystemPrompt('startup_collaboration', `
You are a collaboration specialist for Saudi municipal innovation startups.
Identify potential collaboration opportunities between startups for joint proposals and consortiums.
`);

/**
 * Build collaboration recommendation prompt
 * @param {Object} params - Startup and potential partners data
 * @returns {string} Formatted prompt
 */
export function buildCollaborationRecommenderPrompt({ startup, potentialPartners, targetChallenge }) {
  return `Recommend collaboration partners for this startup:

STARTUP: ${startup?.name_en || 'Unknown'}
SECTORS: ${startup?.sectors?.join(', ') || 'general'}
STRENGTHS: ${startup?.competitive_advantages || 'Not specified'}

${targetChallenge ? `
TARGET CHALLENGE: ${targetChallenge.title_en}
REQUIRED CAPABILITIES: ${targetChallenge.required_capabilities?.join(', ') || 'Various'}
BUDGET: ${targetChallenge.budget_estimate || 'TBD'} SAR
` : ''}

POTENTIAL PARTNERS (${potentialPartners?.length || 0}):
${potentialPartners?.slice(0, 10).map(p => 
  `- ${p.name_en}: ${p.sectors?.join(', ')} | ${p.competitive_advantages?.substring(0, 100) || 'N/A'}`
).join('\n') || 'None available'}

Recommend:
1. Top 3 collaboration partners with scores
2. Synergy analysis for each
3. Joint proposal strategy
4. Role distribution suggestions
5. Potential risks and mitigations`;
}

export const COLLABORATION_RECOMMENDER_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          partner_name: { type: "string" },
          synergy_score: { type: "number" },
          synergy_analysis: { type: "string" },
          suggested_role: { type: "string" }
        }
      }
    },
    joint_proposal_strategy: { type: "string" },
    role_distribution: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } }
  },
  required: ["recommendations"]
};

export const COLLABORATION_RECOMMENDER_PROMPTS = {
  systemPrompt: COLLABORATION_RECOMMENDER_SYSTEM_PROMPT,
  buildPrompt: buildCollaborationRecommenderPrompt,
  schema: COLLABORATION_RECOMMENDER_SCHEMA
};

export default COLLABORATION_RECOMMENDER_PROMPTS;
