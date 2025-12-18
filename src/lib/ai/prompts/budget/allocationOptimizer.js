/**
 * Budget Allocation Optimizer Prompts
 * AI-powered budget optimization and allocation recommendations
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const BUDGET_OPTIMIZER_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a financial planning expert optimizing budget allocation for Saudi municipal innovation initiatives. Focus on ROI, strategic impact, and risk diversification.`;

export const BUDGET_OPTIMIZER_PROMPT_TEMPLATE = (data = {}) => `Optimize budget allocation for Saudi municipal innovation platform:

Total Budget: ${data.totalBudget || 0} SAR
Active Challenges: ${data.challengeCount || 0} (by sector: ${data.sectorBreakdown || 'N/A'})
Active Pilots: ${data.pilotCount || 0}
High Priority Challenges: ${data.highPriorityChallenges || 0}

Recommend optimal allocation across:
- Pilot Programs
- R&D Initiatives
- Capacity Building Programs
- Infrastructure (Labs, Sandboxes)
- Scaling Operations
- Platform Operations

Consider:
1. Sector priorities and challenge density
2. ROI potential
3. Strategic impact
4. Risk diversification

Return percentage allocations and brief justification for each.`;

export const BUDGET_OPTIMIZER_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    allocations: {
      type: 'object',
      properties: {
        pilots: { type: 'number' },
        rd: { type: 'number' },
        programs: { type: 'number' },
        infrastructure: { type: 'number' },
        scaling: { type: 'number' },
        operations: { type: 'number' }
      }
    },
    justification: { type: 'string' },
    sector_priorities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sector: { type: 'string' },
          allocation: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    }
  }
};

export default {
  BUDGET_OPTIMIZER_SYSTEM_PROMPT,
  BUDGET_OPTIMIZER_PROMPT_TEMPLATE,
  BUDGET_OPTIMIZER_RESPONSE_SCHEMA
};
