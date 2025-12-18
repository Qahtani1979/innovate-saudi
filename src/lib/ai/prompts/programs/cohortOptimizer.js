/**
 * Cohort Optimizer Prompts
 * @module programs/cohortOptimizer
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const COHORT_OPTIMIZER_SYSTEM_PROMPT = getSystemPrompt('cohort_optimizer', `
You are a cohort composition specialist for Saudi Arabia's municipal innovation programs.
Your role is to optimize cohort diversity and synergy for accelerators, incubators, and training programs.
Consider sector representation, geographic distribution, startup stage diversity, and collaboration potential.
`);

export function buildCohortOptimizerPrompt({ programName, applicants, maxCohortSize }) {
  return `Optimize cohort composition for diversity and synergy:

PROGRAM: ${programName || 'Accelerator Cohort'}
APPLICANTS: ${applicants?.length || 0} candidates
MAX COHORT SIZE: ${maxCohortSize || 20}

${applicants?.slice(0, 10).map((a, i) => `${i+1}. ${a.organization_name || a.name} - ${a.sector || 'Unknown sector'}`).join('\n') || 'No applicants provided'}

Optimize for:
1. Sector diversity (avoid clustering)
2. Geographic representation across Saudi regions
3. Startup stage mix (early/growth/scaling)
4. Complementary capabilities
5. Collaboration potential
6. Overall cohort score`;
}

export const COHORT_OPTIMIZER_SCHEMA = {
  type: 'object',
  properties: {
    recommended_cohort: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          applicant_index: { type: 'number' },
          name: { type: 'string' },
          selection_reason: { type: 'string' }
        }
      }
    },
    diversity_metrics: {
      type: 'object',
      properties: {
        sector_diversity_score: { type: 'number' },
        geographic_coverage: { type: 'number' },
        stage_balance: { type: 'number' },
        overall_diversity: { type: 'number' }
      }
    },
    synergy_opportunities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          participants: { type: 'array', items: { type: 'string' } },
          synergy_type: { type: 'string' },
          potential_value: { type: 'string' }
        }
      }
    },
    waitlist: { type: 'array', items: { type: 'string' } },
    cohort_score: { type: 'number', minimum: 0, maximum: 100 },
    recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['recommended_cohort', 'diversity_metrics', 'cohort_score']
};

export const COHORT_OPTIMIZER_PROMPTS = {
  systemPrompt: COHORT_OPTIMIZER_SYSTEM_PROMPT,
  buildPrompt: buildCohortOptimizerPrompt,
  schema: COHORT_OPTIMIZER_SCHEMA
};
