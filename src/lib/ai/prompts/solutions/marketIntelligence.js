/**
 * Solution Market Intelligence Prompts
 * @module solutions/marketIntelligence
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MARKET_INTELLIGENCE_SYSTEM_PROMPT = getSystemPrompt('solutions_market');

export const buildMarketIntelligencePrompt = (solution) => `Provide market intelligence for this municipal innovation solution:

Solution: ${solution.name_en}
Category: ${solution.category}
Description: ${solution.description_en}

Research and provide:
1. Global market trends in this category (2024-2025)
2. Estimated global market size and growth rate
3. Key competitors and market leaders
4. Emerging technologies in this space
5. Pricing benchmarks (if available)
6. Success factors for market penetration`;

export const MARKET_INTELLIGENCE_SCHEMA = {
  type: "object",
  properties: {
    market_trends: { type: "array", items: { type: "string" } },
    market_size: { type: "string" },
    competitors: { type: "array", items: { type: "string" } },
    emerging_tech: { type: "array", items: { type: "string" } },
    pricing_insights: { type: "string" },
    success_factors: { type: "array", items: { type: "string" } }
  }
};

export const MARKET_INTELLIGENCE_PROMPTS = {
  systemPrompt: MARKET_INTELLIGENCE_SYSTEM_PROMPT,
  buildPrompt: buildMarketIntelligencePrompt,
  schema: MARKET_INTELLIGENCE_SCHEMA
};

export default MARKET_INTELLIGENCE_PROMPTS;
