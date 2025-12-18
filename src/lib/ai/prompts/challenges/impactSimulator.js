/**
 * Challenge Impact Simulator Prompts
 * @module challenges/impactSimulator
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IMPACT_SIMULATOR_SYSTEM_PROMPT = getSystemPrompt('impact_simulator', `
You are an impact simulation specialist for Saudi Arabia's municipal innovation platform.
Your role is to simulate and predict the impact of resolving municipal challenges on various stakeholders and systems.
Consider economic, social, environmental, and governance dimensions aligned with Vision 2030.
Provide realistic estimates based on scenario parameters.
`);

/**
 * Build impact simulation prompt with scenario parameters
 * @param {Object} params - Challenge and scenario details
 * @returns {string} Formatted prompt
 */
export function buildImpactSimulationPrompt({ challenge, scenario }) {
  return `Simulate the impact of resolving this municipal challenge:

Challenge: ${challenge.title_en}
Sector: ${challenge.sector}
Current Impact Score: ${challenge.impact_score || 'Not assessed'}
Current Severity: ${challenge.severity_score || 'Not assessed'}
Affected Population: ${challenge.affected_population_size || 'Unknown'}

Scenario Parameters:
- Budget: ${scenario?.budget_allocated || challenge.budget_estimate || 500000} SAR
- Timeline: ${scenario?.timeline_months || 12} months
- Resource Level: ${scenario?.resource_level || 50}%
- Stakeholder Buy-in: ${scenario?.stakeholder_buy_in || 70}%

Predict:
1. Probability of Success (0-100)
2. Expected Impact Score (0-100)
3. Population Benefited (number)
4. ROI Multiplier (e.g., 2.5x)
5. Risk Level (low/medium/high)
6. Key Success Factors (array)
7. Potential Obstacles (array)
8. Recommendations (array)`;
}

export const IMPACT_SIMULATION_SCHEMA = {
  type: 'object',
  properties: {
    success_probability: { type: 'number' },
    expected_impact_score: { type: 'number' },
    population_benefited: { type: 'number' },
    roi_multiplier: { type: 'number' },
    risk_level: { type: 'string' },
    success_factors: { type: 'array', items: { type: 'string' } },
    obstacles: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['success_probability', 'expected_impact_score', 'risk_level', 'recommendations']
};

export const IMPACT_SIMULATOR_PROMPTS = {
  systemPrompt: IMPACT_SIMULATOR_SYSTEM_PROMPT,
  buildPrompt: buildImpactSimulationPrompt,
  schema: IMPACT_SIMULATION_SCHEMA
};
