/**
 * Match Success Predictor Prompt
 * Predicts probability of successful pilot conversion from a match
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for match success prediction
 * @param {Object} params - Match parameters
 * @param {Object} params.provider - Provider details
 * @param {Object} params.challenge - Challenge details
 * @returns {string} Formatted prompt
 */
export function getMatchSuccessPredictorPrompt({ provider, challenge }) {
  return `${SAUDI_CONTEXT.COMPACT}

You are an AI system predicting match success for municipal innovation partnerships.

Analyze this potential match and predict success probability:

PROVIDER PROFILE:
- Name: ${provider.name_en || 'Unknown Provider'}
- Track Record: ${provider.success_rate || 70}% historical success rate
- Deployments: ${provider.deployment_count || 0} completed
- Sectors: ${provider.sectors?.join(', ') || 'Not specified'}
- Company Stage: ${provider.company_stage || 'Not specified'}

CHALLENGE DETAILS:
- Title: ${challenge.title_en}
- Sector: ${challenge.sector || 'Not specified'}
- Complexity Score: ${challenge.overall_score || 50}/100
- Budget Estimate: ${challenge.budget_estimate || 'TBD'} SAR
- Priority: ${challenge.priority || 'Not specified'}
- Timeline: ${challenge.timeline_estimate || 'Not specified'}

ANALYSIS REQUIRED:
1. Calculate overall success probability (0-100%)
2. Score each dimension (0-100):
   - capability_fit: Provider capabilities vs challenge requirements
   - sector_expertise: Provider experience in this sector
   - track_record: Historical performance
   - budget_alignment: Budget expectations alignment
   - team_capacity: Current capacity to take on project
3. Identify key risk factors
4. Provide recommendation: proceed, alternative, or needs_support

Consider Saudi municipal context, Vision 2030 alignment, and local market dynamics.`;
}

/**
 * Schema for match success prediction
 */
export const matchSuccessPredictorSchema = createBilingualSchema({
  name: "match_success_prediction",
  description: "Predicts match success probability with dimension scores",
  properties: {
    success_probability: {
      type: "number",
      description: "Overall success probability (0-100)"
    },
    dimension_scores: {
      type: "object",
      description: "Scores for each evaluation dimension",
      properties: {
        capability_fit: { type: "number", description: "Capability fit score (0-100)" },
        sector_expertise: { type: "number", description: "Sector expertise score (0-100)" },
        track_record: { type: "number", description: "Track record score (0-100)" },
        budget_alignment: { type: "number", description: "Budget alignment score (0-100)" },
        team_capacity: { type: "number", description: "Team capacity score (0-100)" }
      },
      required: ["capability_fit", "sector_expertise", "track_record", "budget_alignment", "team_capacity"]
    },
    risk_factors: {
      type: "array",
      items: { type: "string" },
      description: "Key risk factors identified"
    },
    recommendation: {
      type: "string",
      description: "Recommendation: proceed, alternative, or needs_support"
    }
  },
  required: ["success_probability", "dimension_scores", "risk_factors", "recommendation"]
});
