/**
 * Startup Opportunity Scorer Prompts
 * @module startup/opportunityScorer
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const OPPORTUNITY_SCORER_SYSTEM_PROMPT = getSystemPrompt('opportunity_scoring', `
You are an opportunity scoring specialist for Saudi municipal innovation startups.
Evaluate challenges and programs as opportunities for startups based on fit and success probability.
`);

/**
 * Build opportunity scoring prompt
 * @param {Object} params - Startup and opportunity data
 * @returns {string} Formatted prompt
 */
export function buildOpportunityScorerPrompt({ startup, opportunity, opportunityType }) {
  return `Score this ${opportunityType} opportunity for the startup:

STARTUP: ${startup?.name_en || 'Unknown'}
SECTORS: ${startup?.sectors?.join(', ') || 'general'}
SOLUTIONS: ${startup?.solutions_count || 0}
SUCCESS RATE: ${startup?.pilot_success_rate || 0}%
STAGE: ${startup?.funding_stage || 'early'}

OPPORTUNITY (${opportunityType}):
Title: ${opportunity?.title_en || opportunity?.name_en || 'Unknown'}
Sector: ${opportunity?.sector || 'general'}
Budget: ${opportunity?.budget_estimate || 'TBD'} SAR
Priority: ${opportunity?.priority || 'N/A'}
Description: ${opportunity?.description_en?.substring(0, 300) || 'Not provided'}

Evaluate:
1. Fit score (0-100)
2. Success probability (0-100)
3. Strategic alignment factors
4. Potential challenges
5. Recommended approach
6. Effort estimate (low/medium/high)`;
}

export const OPPORTUNITY_SCORER_SCHEMA = {
  type: "object",
  properties: {
    fit_score: { type: "number" },
    success_probability: { type: "number" },
    alignment_factors: { type: "array", items: { type: "string" } },
    potential_challenges: { type: "array", items: { type: "string" } },
    recommended_approach: { type: "string" },
    effort_estimate: { type: "string" }
  },
  required: ["fit_score", "success_probability", "recommended_approach"]
};

export const OPPORTUNITY_SCORER_PROMPTS = {
  systemPrompt: OPPORTUNITY_SCORER_SYSTEM_PROMPT,
  buildPrompt: buildOpportunityScorerPrompt,
  schema: OPPORTUNITY_SCORER_SCHEMA
};

export default OPPORTUNITY_SCORER_PROMPTS;
