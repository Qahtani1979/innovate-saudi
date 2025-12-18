/**
 * Challenge Trend Prediction Prompts
 * @module challenges/trendPredictor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TREND_PREDICTOR_SYSTEM_PROMPT = getSystemPrompt('trend_predictor', `
You are a municipal challenge trend analyst for Saudi Arabia.
Your role is to predict emerging challenges, identify patterns, and forecast future needs.
Consider demographic changes, urbanization, climate factors, and Vision 2030 impacts.
`);

/**
 * Build trend prediction prompt
 * @param {Object} params - Historical and current data
 * @returns {string} Formatted prompt
 */
export function buildTrendPredictorPrompt({ historicalChallenges, currentTrends, municipality, timeframe }) {
  return `Predict challenge trends for this municipality:

MUNICIPALITY: ${municipality?.name_en || 'Saudi Municipality'}
REGION: ${municipality?.region || 'Unknown'}
TIMEFRAME: ${timeframe || '12 months'}

HISTORICAL CHALLENGES (last 12 months):
${(historicalChallenges || []).slice(0, 15).map(c => 
  `- ${c.sector || 'General'}: ${c.title_en || c.title}`
).join('\n')}

CURRENT TRENDS: ${JSON.stringify(currentTrends || {})}

Predict:
1. Emerging challenge categories (next ${timeframe || '12 months'})
2. Expected volume changes by sector
3. Seasonal patterns
4. Risk factors and early warning signs
5. Recommended proactive measures
6. Resource allocation suggestions`;
}

export const TREND_PREDICTOR_SCHEMA = {
  type: "object",
  properties: {
    emerging_categories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          probability: { type: "number" },
          expected_impact: { type: "string" },
          drivers: { type: "array", items: { type: "string" } }
        }
      }
    },
    volume_forecast: {
      type: "object",
      additionalProperties: { type: "number" }
    },
    seasonal_patterns: { type: "array", items: { type: "string" } },
    risk_factors: { type: "array", items: { type: "string" } },
    proactive_measures: { type: "array", items: { type: "string" } }
  },
  required: ["emerging_categories", "proactive_measures"]
};

export const TREND_PREDICTOR_PROMPTS = {
  systemPrompt: TREND_PREDICTOR_SYSTEM_PROMPT,
  buildPrompt: buildTrendPredictorPrompt,
  schema: TREND_PREDICTOR_SCHEMA
};
