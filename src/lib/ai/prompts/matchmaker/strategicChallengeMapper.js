/**
 * Strategic Challenge Mapper Prompt
 * Maps applications to strategic challenges for bonus points
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for strategic challenge mapping
 * @param {Object} params - Mapping parameters
 * @param {Object} params.application - Provider application
 * @param {Array} params.challenges - Strategic challenges
 * @returns {string} Formatted prompt
 */
export function getStrategicChallengeMapperPrompt({ application, challenges }) {
  const challengeList = challenges.map(c => `
- ID: ${c.id}, Code: ${c.code}
  Title: ${c.title_en}
  Sector: ${c.sector}
  Priority: ${c.priority}
  Description: ${c.description_en?.substring(0, 150) || 'No description'}
`).join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system mapping provider applications to strategic municipal challenges.

Match this application to strategic challenges for bonus points evaluation.

APPLICATION DETAILS:
- Organization: ${application.organization_name_en}
- Sectors: ${application.sectors?.join(', ') || 'Not specified'}
- Collaboration Approach: ${application.collaboration_approach || 'Not specified'}
- Geographic Scope: ${application.geographic_scope?.join(', ') || 'National'}

STRATEGIC CHALLENGES (Tier 1 & Tier 2):
${challengeList}

For each challenge this application could address, provide:
- challenge_id: The challenge UUID
- challenge_code: The challenge code
- relevance_score: How relevant is this application (0-100)
- bonus_points: Suggest 5, 10, or 15 based on fit strength
- reason_en: Why it matches (English)
- reason_ar: Why it matches (Arabic)

Only include challenges with relevance_score >= 60.`;
}

/**
 * Schema for strategic challenge mapping results
 */
export const strategicChallengeMapperSchema = createBilingualSchema({
  name: "strategic_challenge_mapping",
  description: "Maps applications to strategic challenges with bonus points",
  properties: {
    matches: {
      type: "array",
      description: "Matched strategic challenges",
      items: {
        type: "object",
        properties: {
          challenge_id: { type: "string", description: "Challenge UUID" },
          challenge_code: { type: "string", description: "Challenge code" },
          relevance_score: { type: "number", description: "Relevance score (0-100)" },
          bonus_points: { type: "number", description: "Bonus points (5, 10, or 15)" },
          reason_en: { type: "string", description: "Match reason in English" },
          reason_ar: { type: "string", description: "Match reason in Arabic" }
        },
        required: ["challenge_id", "challenge_code", "relevance_score", "bonus_points", "reason_en", "reason_ar"]
      }
    }
  },
  required: ["matches"]
});
