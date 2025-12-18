/**
 * Challenge Impact Simulator Prompts
 * @module challenges/impactSimulator
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IMPACT_SIMULATOR_SYSTEM_PROMPT = getSystemPrompt('impact_simulator', `
You are an impact simulation specialist for Saudi Arabia's municipal innovation platform.
Your role is to simulate and predict the impact of resolving municipal challenges on various stakeholders and systems.
Consider economic, social, environmental, and governance dimensions aligned with Vision 2030.
`);

export function buildImpactSimulationPrompt({ challenge }) {
  return `Simulate the impact of resolving this municipal challenge:

Challenge: ${challenge.title_en}
Sector: ${challenge.sector}
Priority: ${challenge.priority}
Affected Population: ${challenge.affected_population_size || 'Unknown'}
Budget Estimate: ${challenge.budget_estimate || 'Not specified'}

Simulate impact across:
1. Economic benefits (cost savings, productivity gains)
2. Social outcomes (quality of life, accessibility)
3. Environmental impact (sustainability metrics)
4. Governance efficiency (process improvements)
5. Timeline to realize benefits
6. Confidence level of predictions`;
}

export const IMPACT_SIMULATION_SCHEMA = {
  type: 'object',
  properties: {
    economic_impact: {
      type: 'object',
      properties: {
        cost_savings_sar: { type: 'number' },
        productivity_gain_percent: { type: 'number' },
        roi_estimate: { type: 'number' },
        description: { type: 'string' }
      }
    },
    social_impact: {
      type: 'object',
      properties: {
        beneficiaries_count: { type: 'number' },
        quality_of_life_improvement: { type: 'string' },
        accessibility_improvement: { type: 'string' },
        description: { type: 'string' }
      }
    },
    environmental_impact: {
      type: 'object',
      properties: {
        carbon_reduction_tons: { type: 'number' },
        sustainability_score: { type: 'number' },
        description: { type: 'string' }
      }
    },
    governance_impact: {
      type: 'object',
      properties: {
        efficiency_gain_percent: { type: 'number' },
        process_improvements: { type: 'array', items: { type: 'string' } },
        description: { type: 'string' }
      }
    },
    timeline_months: { type: 'number' },
    confidence_level: { type: 'number', minimum: 0, maximum: 100 },
    key_assumptions: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } }
  },
  required: ['economic_impact', 'social_impact', 'timeline_months', 'confidence_level']
};

export const IMPACT_SIMULATOR_PROMPTS = {
  systemPrompt: IMPACT_SIMULATOR_SYSTEM_PROMPT,
  buildPrompt: buildImpactSimulationPrompt,
  schema: IMPACT_SIMULATION_SCHEMA
};
