/**
 * Enhanced Matching Engine Prompt
 * Bilateral matching between providers and challenges
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for bilateral matching
 * @param {Object} params - Matching parameters
 * @param {Object} params.application - Provider application
 * @param {Array} params.challenges - Available challenges
 * @param {Object} params.preferences - Matching preferences
 * @returns {string} Formatted prompt
 */
export function getEnhancedMatchingPrompt({ application, challenges, preferences }) {
  const challengeList = challenges.map(c => 
    `- ${c.code}: ${c.title_en} (Sector: ${c.sector}, Priority: ${c.priority}, Score: ${c.overall_score})`
  ).join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are an AI matching engine for Saudi municipal innovation partnerships.

Perform bilateral matching between this provider and available challenges:

PROVIDER APPLICATION:
- Organization: ${application.organization_name_en}
- Sectors: ${application.sectors?.join(', ') || 'Not specified'}
- Geographic Scope: ${application.geographic_scope?.join(', ') || 'National'}
- Company Stage: ${application.company_stage || 'Not specified'}
- Total Score: ${application.evaluation_score?.total_score || 'Pending'}
- Collaboration Approach: ${application.collaboration_approach || 'Not specified'}

MATCHING PREFERENCES:
- Minimum Score Threshold: ${preferences.min_score}
- Maximum Matches: ${preferences.max_matches}
- Tier 1 Only: ${preferences.include_tier_1_only}

AVAILABLE CHALLENGES:
${challengeList}

For each match, provide:
- challenge_code: The challenge code
- match_score: Overall match score (0-100)
- sector_fit: Sector alignment score (0-100)
- capability_fit: Capability match score (0-100)
- strategic_fit: Strategic alignment score (0-100)
- match_rationale: Brief explanation (1 sentence)

Return top ${preferences.max_matches} matches ordered by match_score.`;
}

/**
 * Schema for enhanced matching results
 */
export const enhancedMatchingSchema = createBilingualSchema({
  name: "enhanced_matching_results",
  description: "Bilateral matching results between provider and challenges",
  properties: {
    matches: {
      type: "array",
      description: "List of matched challenges",
      items: {
        type: "object",
        properties: {
          challenge_code: { type: "string", description: "Challenge code identifier" },
          match_score: { type: "number", description: "Overall match score (0-100)" },
          sector_fit: { type: "number", description: "Sector fit score (0-100)" },
          capability_fit: { type: "number", description: "Capability fit score (0-100)" },
          strategic_fit: { type: "number", description: "Strategic fit score (0-100)" },
          match_rationale: { type: "string", description: "Brief rationale for match" }
        },
        required: ["challenge_code", "match_score", "sector_fit", "capability_fit", "strategic_fit", "match_rationale"]
      }
    }
  },
  required: ["matches"]
});
