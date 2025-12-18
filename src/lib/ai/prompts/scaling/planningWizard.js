/**
 * Scaling Planning Wizard Prompts
 * @module scaling/planningWizard
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SCALING_PLANNING_SYSTEM_PROMPT = getSystemPrompt('scaling');

export const buildScalingEstimatesPrompt = (pilot, targetMunicipalitiesCount) => `You are a scaling expert. Based on this pilot information, provide estimates:
        
Pilot: ${pilot?.title_en}
Sector: ${pilot?.sector}
Budget: ${pilot?.budget} SAR
Duration: ${pilot?.duration_weeks} weeks
Success metrics: ${JSON.stringify(pilot?.success_criteria || [])}
Target municipalities: ${targetMunicipalitiesCount}

Estimate:
1. Total budget needed for scaling (in SAR)
2. Timeline in months
3. Budget per municipality
4. Phased rollout plan (3 phases)
5. Key risk factors`;

export const SCALING_ESTIMATES_SCHEMA = {
  type: 'object',
  properties: {
    total_budget: { type: 'number' },
    timeline_months: { type: 'number' },
    budget_per_municipality: { type: 'number' },
    phases: { 
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          duration_months: { type: 'number' },
          municipalities_count: { type: 'number' },
          activities: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    risk_factors: { type: 'array', items: { type: 'string' } }
  }
};

export const SCALING_PLANNING_PROMPTS = {
  systemPrompt: SCALING_PLANNING_SYSTEM_PROMPT,
  buildPrompt: buildScalingEstimatesPrompt,
  schema: SCALING_ESTIMATES_SCHEMA
};

export default SCALING_PLANNING_PROMPTS;
