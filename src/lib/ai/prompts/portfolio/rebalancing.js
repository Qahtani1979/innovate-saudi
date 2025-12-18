/**
 * Portfolio Rebalancing Prompts
 * Centralized prompts for portfolio analysis and rebalancing
 * @module prompts/portfolio/rebalancing
 */

export const PORTFOLIO_REBALANCING_SCHEMA = {
  type: 'object',
  properties: {
    overinvested: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sector_en: { type: 'string' },
          sector_ar: { type: 'string' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          suggested_reduction: { type: 'number' }
        }
      }
    },
    underinvested: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sector_en: { type: 'string' },
          sector_ar: { type: 'string' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' },
          suggested_increase: { type: 'number' }
        }
      }
    },
    reallocations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from_en: { type: 'string' },
          from_ar: { type: 'string' },
          to_en: { type: 'string' },
          to_ar: { type: 'string' },
          amount_percentage: { type: 'number' },
          impact_en: { type: 'string' },
          impact_ar: { type: 'string' }
        }
      }
    },
    quick_wins: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action_en: { type: 'string' },
          action_ar: { type: 'string' },
          expected_impact_en: { type: 'string' },
          expected_impact_ar: { type: 'string' }
        }
      }
    },
    strategic_shifts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          shift_en: { type: 'string' },
          shift_ar: { type: 'string' },
          rationale_en: { type: 'string' },
          rationale_ar: { type: 'string' }
        }
      }
    },
    what_if_scenarios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          scenario_en: { type: 'string' },
          scenario_ar: { type: 'string' },
          outcome_en: { type: 'string' },
          outcome_ar: { type: 'string' }
        }
      }
    }
  }
};

export const PORTFOLIO_REBALANCING_PROMPT_TEMPLATE = (context) => `
Analyze this innovation portfolio and recommend rebalancing strategy for Saudi municipalities:

Current Distribution:
${JSON.stringify(context.currentPortfolio, null, 2)}

Total Challenges: ${context.totalChallenges}
Total Pilots: ${context.totalPilots}
High Priority Challenges: ${context.highPriorityChallenges}
Active Pilots at Risk: ${context.atRiskPilots}

Provide bilingual recommendations:
1. Overinvested sectors (too many pilots vs challenges)
2. Underinvested sectors (high challenges, low coverage)
3. Recommended reallocations (move resources from X to Y)
4. Quick wins (low-hanging fruit to address)
5. Strategic shifts needed
6. What-if scenarios (e.g., "If we reduce X by 20%, we could increase Y by 30%")`;

export const PORTFOLIO_REBALANCING_PROMPT = {
  system: `You are a strategic portfolio analyst for Saudi municipal innovation programs.
Analyze portfolio distribution against Vision 2030 priorities and recommend optimal resource allocation.
Provide bilingual (English/Arabic) recommendations.`,
  schema: PORTFOLIO_REBALANCING_SCHEMA
};

export default {
  PORTFOLIO_REBALANCING_SCHEMA,
  PORTFOLIO_REBALANCING_PROMPT_TEMPLATE,
  PORTFOLIO_REBALANCING_PROMPT
};
