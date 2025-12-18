/**
 * Municipality Capacity Planning Prompts
 * @module municipalities/capacityPlanning
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CAPACITY_PLANNING_SYSTEM_PROMPT = getSystemPrompt('capacity_planning', `
You are a capacity planning specialist for Saudi municipal innovation programs.
Your role is to assess and optimize resource allocation, team capabilities, and project capacity.
Consider Saudi government fiscal cycles and Vision 2030 priorities.
`);

/**
 * Build capacity planning prompt
 * @param {Object} params - Municipality and resource data
 * @returns {string} Formatted prompt
 */
export function buildCapacityPlanningPrompt({ municipality, activePilots, teamSize, budget }) {
  return `Analyze capacity for innovation initiatives:

MUNICIPALITY: ${municipality?.name_en || 'Unknown'}
REGION: ${municipality?.region || 'Unknown'}
ACTIVE PILOTS: ${activePilots?.length || 0}
TEAM SIZE: ${teamSize || 'Unknown'}
AVAILABLE BUDGET: ${budget || 'Not specified'}

Provide:
1. Current capacity utilization (%)
2. Recommended pilot load
3. Resource gaps identified
4. Training needs
5. Budget optimization suggestions
6. Quarterly capacity forecast`;
}

export const CAPACITY_PLANNING_SCHEMA = {
  type: "object",
  properties: {
    capacity_utilization: { type: "number" },
    recommended_pilot_load: { type: "number" },
    resource_gaps: { type: "array", items: { type: "string" } },
    training_needs: { type: "array", items: { type: "string" } },
    budget_optimization: { type: "array", items: { type: "string" } },
    quarterly_forecast: { type: "object" }
  },
  required: ["capacity_utilization", "recommended_pilot_load", "resource_gaps"]
};

export const CAPACITY_PLANNING_PROMPTS = {
  systemPrompt: CAPACITY_PLANNING_SYSTEM_PROMPT,
  buildPrompt: buildCapacityPlanningPrompt,
  schema: CAPACITY_PLANNING_SCHEMA
};
