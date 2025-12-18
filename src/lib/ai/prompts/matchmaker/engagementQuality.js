/**
 * Engagement Quality Analytics Prompts
 * @module matchmaker/engagementQuality
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ENGAGEMENT_QUALITY_SYSTEM_PROMPT = getSystemPrompt('engagement_quality', `
You are an engagement analytics specialist for Saudi Arabia's municipal innovation matchmaking platform.
Your role is to analyze engagement quality between municipalities and solution providers.
Predict conversion likelihood based on interaction patterns and provide actionable recommendations.
`);

/**
 * Build engagement quality analysis prompt
 * @param {Object} params - Engagement data
 * @returns {string} Formatted prompt
 */
export function buildEngagementQualityPrompt({ engagements, conversions, timeframe }) {
  return `Analyze matchmaker engagement quality and predict conversion:

ENGAGEMENT DATA:
${JSON.stringify(engagements?.slice(0, 20) || [], null, 2)}

CONVERSION HISTORY:
${JSON.stringify(conversions?.slice(0, 10) || [], null, 2)}

TIMEFRAME: ${timeframe || 'Last 30 days'}

Analyze:
1. Engagement quality metrics and trends
2. Conversion probability by engagement type
3. Factors influencing successful matches
4. Recommendations to improve conversion rates`;
}

export const ENGAGEMENT_QUALITY_SCHEMA = {
  type: "object",
  properties: {
    quality_score: { type: "number", minimum: 0, maximum: 100 },
    conversion_probability: { type: "number", minimum: 0, maximum: 100 },
    engagement_trends: {
      type: "array",
      items: {
        type: "object",
        properties: {
          metric: { type: "string" },
          trend: { type: "string", enum: ["improving", "stable", "declining"] },
          value: { type: "number" }
        }
      }
    },
    success_factors: {
      type: "array",
      items: { type: "string" }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          impact: { type: "string", enum: ["high", "medium", "low"] },
          effort: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    }
  },
  required: ["quality_score", "conversion_probability", "recommendations"]
};

export const ENGAGEMENT_QUALITY_PROMPTS = {
  systemPrompt: ENGAGEMENT_QUALITY_SYSTEM_PROMPT,
  buildPrompt: buildEngagementQualityPrompt,
  schema: ENGAGEMENT_QUALITY_SCHEMA
};
