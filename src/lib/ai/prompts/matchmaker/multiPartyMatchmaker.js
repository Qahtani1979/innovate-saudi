/**
 * Multi-Party Matchmaker Prompt
 * Creates optimal consortiums for complex challenges
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for multi-party consortium formation
 * @param {Object} params - Consortium parameters
 * @param {Object} params.challenge - Challenge requiring consortium
 * @returns {string} Formatted prompt
 */
export function getMultiPartyMatchmakerPrompt({ challenge }) {
  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system forming optimal consortiums for complex municipal challenges in Saudi Arabia.

CHALLENGE DETAILS:
- Title: ${challenge?.title_en || 'Complex Municipal Challenge'}
- Sector: ${challenge?.sector || 'Multi-sector'}
- Complexity: ${challenge?.overall_score || 'High'}
- Budget: ${challenge?.budget_estimate || 'TBD'} SAR

Create an optimal consortium for this complex challenge requiring:
- Technology provider (IoT/sensors/software)
- System integrator (implementation expertise)
- Maintenance operator (ongoing operations)
- Data analytics partner (insights and optimization)

For each consortium party, provide:
1. party_name: Suggested company type/profile
2. role: Specific role in the consortium
3. contribution: What they bring to the project
4. synergy: How they complement other parties

Suggest 3-4 parties that would form a well-balanced consortium.
Consider Saudi market dynamics and local partnership requirements.`;
}

/**
 * Schema for multi-party consortium
 */
export const multiPartyMatchmakerSchema = createBilingualSchema({
  name: "multi_party_consortium",
  description: "Optimal consortium formation for complex challenges",
  properties: {
    parties: {
      type: "array",
      description: "Consortium parties",
      items: {
        type: "object",
        properties: {
          party_name: { type: "string", description: "Party name or profile type" },
          role: { type: "string", description: "Role in the consortium" },
          contribution: { type: "string", description: "Key contribution to the project" },
          synergy: { type: "string", description: "How they complement other parties" }
        },
        required: ["party_name", "role", "contribution", "synergy"]
      }
    }
  },
  required: ["parties"]
});
