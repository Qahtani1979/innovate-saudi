/**
 * Dynamic Pricing Intelligence Prompts
 * @module solutions/dynamicPricing
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DYNAMIC_PRICING_SYSTEM_PROMPT = getSystemPrompt('dynamic_pricing', `
You are a pricing intelligence specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze solution pricing, market positioning, and competitive dynamics.
Provide data-driven pricing recommendations aligned with Vision 2030 value creation.
`);

/**
 * Build dynamic pricing analysis prompt
 * @param {Object} params - Solution and competitor data
 * @returns {string} Formatted prompt
 */
export function buildDynamicPricingPrompt({ solution, peers }) {
  return `Pricing intelligence for solution:

SOLUTION: ${solution.name_en}
MATURITY: ${solution.maturity_level}
TRL: ${solution.trl || 'N/A'}
SECTORS: ${solution.sectors?.join(', ') || 'N/A'}
DEPLOYMENTS: ${solution.deployment_count || 0}

COMPETITOR DATA: ${peers?.length || 0} similar solutions
Sample pricing: ${peers?.slice(0, 5).map(s => 
  `${s.name_en}: ${s.pricing_details?.setup_cost || '?'} SAR`
).join(', ') || 'No data'}

Provide:
1. Recommended price range (min-max SAR)
2. Average competitor pricing
3. Price elasticity estimate (win rate at different prices)
4. Optimal price for conversion vs margin
5. Market positioning advice`;
}

export const DYNAMIC_PRICING_SCHEMA = {
  type: 'object',
  properties: {
    recommended_min: { type: 'number' },
    recommended_max: { type: 'number' },
    optimal_price: { type: 'number' },
    competitor_average: { type: 'number' },
    elasticity: {
      type: 'object',
      properties: {
        low_price_winrate: { type: 'number' },
        mid_price_winrate: { type: 'number' },
        high_price_winrate: { type: 'number' }
      }
    },
    positioning_advice: { type: 'string' }
  },
  required: ['recommended_min', 'recommended_max', 'optimal_price']
};

export const DYNAMIC_PRICING_PROMPTS = {
  systemPrompt: DYNAMIC_PRICING_SYSTEM_PROMPT,
  buildPrompt: buildDynamicPricingPrompt,
  schema: DYNAMIC_PRICING_SCHEMA
};
