/**
 * Pilot Scaling Recommender Prompts
 * @module pilots/scalingRecommender
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SCALING_RECOMMENDER_SYSTEM_PROMPT = getSystemPrompt('scaling_recommender', `
You are a pilot scaling strategist for Saudi municipal innovation.
Your role is to assess scaling readiness and recommend optimal scaling paths.
Consider regional variations, resource requirements, and Saudi administrative structures.
`);

/**
 * Build scaling recommendation prompt
 * @param {Object} params - Pilot and context data
 * @returns {string} Formatted prompt
 */
export function buildScalingRecommenderPrompt({ pilot, outcomes, targetRegions, resources }) {
  return `Recommend scaling strategy for this pilot:

PILOT: ${pilot?.title_en || pilot?.name_en || 'Unknown'}
SECTOR: ${pilot?.sector || 'general'}
CURRENT MUNICIPALITY: ${pilot?.municipality_name || 'Unknown'}
SUCCESS RATE: ${pilot?.success_metrics?.rate || 'Not measured'}

OUTCOMES ACHIEVED:
${JSON.stringify(outcomes || {})}

TARGET REGIONS: ${(targetRegions || []).map(r => r.name_en).join(', ') || 'All regions'}
AVAILABLE RESOURCES: ${JSON.stringify(resources || {})}

Recommend:
1. Scaling readiness score (0-100)
2. Recommended scaling model (replicate/adapt/franchise/integrate)
3. Priority regions for scaling
4. Resource requirements per region
5. Timeline estimate
6. Risk factors and mitigations
7. Success probability per region`;
}

export const SCALING_RECOMMENDER_SCHEMA = {
  type: "object",
  properties: {
    readiness_score: { type: "number" },
    recommended_model: { type: "string" },
    priority_regions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          region: { type: "string" },
          priority: { type: "number" },
          success_probability: { type: "number" },
          rationale: { type: "string" }
        }
      }
    },
    resource_requirements: { type: "object" },
    timeline_months: { type: "number" },
    risk_factors: { type: "array", items: { type: "string" } },
    mitigations: { type: "array", items: { type: "string" } }
  },
  required: ["readiness_score", "recommended_model", "priority_regions", "timeline_months"]
};

export const SCALING_RECOMMENDER_PROMPTS = {
  systemPrompt: SCALING_RECOMMENDER_SYSTEM_PROMPT,
  buildPrompt: buildScalingRecommenderPrompt,
  schema: SCALING_RECOMMENDER_SCHEMA
};
