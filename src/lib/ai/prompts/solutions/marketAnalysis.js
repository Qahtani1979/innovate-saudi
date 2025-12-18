/**
 * Solution Market Analysis Prompts
 * @module solutions/marketAnalysis
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MARKET_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('market_analysis', `
You are a market analysis specialist for municipal technology solutions in Saudi Arabia.
Your role is to evaluate market positioning, competitive landscape, and growth potential.
Consider Saudi Vision 2030 alignment and regional market dynamics.
`);

/**
 * Build market analysis prompt
 * @param {Object} params - Solution and market data
 * @returns {string} Formatted prompt
 */
export function buildMarketAnalysisPrompt({ solution, competitors, marketData }) {
  return `Analyze market position for this solution:

SOLUTION: ${solution?.name_en || solution?.title_en || 'Unknown'}
CATEGORY: ${solution?.category || 'general'}
TARGET SECTORS: ${(solution?.sectors || []).join(', ') || 'All'}
COMPETITORS: ${(competitors || []).map(c => c.name_en).join(', ') || 'Unknown'}
MARKET SIZE: ${marketData?.size || 'Not specified'}

Provide:
1. Market positioning assessment
2. Competitive advantages
3. Market gaps and opportunities
4. Growth potential score (1-10)
5. Recommended market strategy
6. Pricing strategy suggestions`;
}

export const MARKET_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    positioning: { type: "string" },
    competitive_advantages: { type: "array", items: { type: "string" } },
    market_gaps: { type: "array", items: { type: "string" } },
    growth_potential: { type: "number" },
    strategy_recommendations: { type: "array", items: { type: "string" } },
    pricing_suggestions: { type: "object" }
  },
  required: ["positioning", "competitive_advantages", "growth_potential"]
};

export const MARKET_ANALYSIS_PROMPTS = {
  systemPrompt: MARKET_ANALYSIS_SYSTEM_PROMPT,
  buildPrompt: buildMarketAnalysisPrompt,
  schema: MARKET_ANALYSIS_SCHEMA
};
