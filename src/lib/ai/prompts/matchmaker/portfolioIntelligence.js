/**
 * Provider Portfolio Intelligence Prompts
 * @module matchmaker/portfolioIntelligence
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PORTFOLIO_INTELLIGENCE_SYSTEM_PROMPT = getSystemPrompt('portfolio_intelligence', `
You are a provider portfolio analyst for Saudi municipal innovation.
Your role is to analyze solution provider portfolios for strategic fit and capability gaps.
Consider market positioning, technical capabilities, and municipality needs alignment.
`);

/**
 * Build portfolio intelligence prompt
 * @param {Object} params - Provider and portfolio data
 * @returns {string} Formatted prompt
 */
export function buildPortfolioIntelligencePrompt({ provider, solutions, pilots, marketContext }) {
  return `Analyze this provider's portfolio:

PROVIDER: ${provider?.organization_name || provider?.name || 'Unknown'}
TYPE: ${provider?.provider_type || 'general'}
SPECIALIZATIONS: ${(provider?.specializations || []).join(', ') || 'Not specified'}

SOLUTIONS (${solutions?.length || 0}):
${(solutions || []).slice(0, 10).map(s => `- ${s.name_en || s.title_en}: TRL ${s.trl_level || 'N/A'}`).join('\n')}

PILOT HISTORY (${pilots?.length || 0}):
${(pilots || []).slice(0, 5).map(p => `- ${p.title_en}: ${p.status}`).join('\n')}

MARKET CONTEXT: ${JSON.stringify(marketContext || {})}

Provide:
1. Portfolio strength assessment
2. Capability gaps identified
3. Market positioning analysis
4. Growth opportunities
5. Risk factors
6. Recommended strategic focus areas
7. Competitive advantages`;
}

export const PORTFOLIO_INTELLIGENCE_SCHEMA = {
  type: "object",
  properties: {
    strength_score: { type: "number" },
    strengths: { type: "array", items: { type: "string" } },
    capability_gaps: { type: "array", items: { type: "string" } },
    market_position: { type: "string" },
    growth_opportunities: { type: "array", items: { type: "string" } },
    risk_factors: { type: "array", items: { type: "string" } },
    strategic_focus: { type: "array", items: { type: "string" } },
    competitive_advantages: { type: "array", items: { type: "string" } }
  },
  required: ["strength_score", "strengths", "capability_gaps", "market_position"]
};

export const PORTFOLIO_INTELLIGENCE_PROMPTS = {
  systemPrompt: PORTFOLIO_INTELLIGENCE_SYSTEM_PROMPT,
  buildPrompt: buildPortfolioIntelligencePrompt,
  schema: PORTFOLIO_INTELLIGENCE_SCHEMA
};
