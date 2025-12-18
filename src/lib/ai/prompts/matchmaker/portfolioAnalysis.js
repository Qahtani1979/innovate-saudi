/**
 * Provider Portfolio Analysis Prompts (Simple Version)
 * @module matchmaker/portfolioAnalysis
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PORTFOLIO_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('portfolio_analysis', `
You are a provider performance analyst for Saudi municipal innovation.
Your role is to analyze provider success patterns and recommend growth strategies.
`);

/**
 * Build portfolio analysis prompt
 * @param {Object} params - Success data by sector
 * @returns {string} Formatted prompt
 */
export function buildPortfolioAnalysisPrompt({ successBySector }) {
  return `Analyze provider portfolio and recommend expansion:

Success by Sector:
${Object.entries(successBySector || {}).map(([s, d]) => `${s}: ${d.success}/${d.total} success`).join('\n')}

Provide:
1. Strong sectors (win rate >70%)
2. Weak sectors (win rate <40%)
3. Untapped opportunities (sectors not explored)
4. Growth recommendations (which capabilities to develop)`;
}

export const PORTFOLIO_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    strong_sectors: { type: "array", items: { type: "string" } },
    weak_sectors: { type: "array", items: { type: "string" } },
    opportunities: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["strong_sectors", "opportunities", "recommendations"]
};

export const PORTFOLIO_ANALYSIS_PROMPTS = {
  systemPrompt: PORTFOLIO_ANALYSIS_SYSTEM_PROMPT,
  buildPrompt: buildPortfolioAnalysisPrompt,
  schema: PORTFOLIO_ANALYSIS_SCHEMA
};
