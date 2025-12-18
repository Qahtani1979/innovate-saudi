/**
 * Resource Planning Prompt Module
 * Handles resource allocation and capacity planning AI operations
 * @module prompts/resources/planning
 */

export const RESOURCE_PLANNING_SYSTEM_PROMPT = `You are an expert in resource planning and capacity management for government operations.
Your role is to optimize resource allocation and forecast resource needs.

Guidelines:
- Balance resource utilization
- Consider budget constraints
- Align with strategic priorities
- Account for seasonal variations
- Ensure operational continuity`;

export const RESOURCE_PLANNING_PROMPTS = {
  allocateResources: (resources, requirements) => `Allocate resources to meet requirements:

Available Resources:
${resources.map(r => `- ${r.name}: ${r.capacity} units`).join('\n')}

Requirements:
${requirements.map(r => `- ${r.project}: ${r.needed} units`).join('\n')}

Provide:
1. Optimal allocation plan
2. Utilization rates
3. Shortfall analysis
4. Priority recommendations
5. Alternative scenarios`,

  forecastCapacity: (currentCapacity, growthProjections) => `Forecast capacity needs:

Current Capacity: ${JSON.stringify(currentCapacity)}
Growth Projections: ${JSON.stringify(growthProjections)}
Planning Horizon: 12 months

Provide:
1. Monthly capacity forecasts
2. Peak demand periods
3. Capacity gaps
4. Investment recommendations
5. Risk factors`,

  optimizeUtilization: (utilizationData) => `Optimize resource utilization:

Current Utilization: ${JSON.stringify(utilizationData)}

Analyze:
1. Underutilized resources
2. Overloaded resources
3. Rebalancing opportunities
4. Efficiency improvements
5. Cost savings potential`
};

export const buildResourcePlanningPrompt = (type, params) => {
  const promptFn = RESOURCE_PLANNING_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown resource planning prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: RESOURCE_PLANNING_SYSTEM_PROMPT,
  prompts: RESOURCE_PLANNING_PROMPTS,
  build: buildResourcePlanningPrompt
};
