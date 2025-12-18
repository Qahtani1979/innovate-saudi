/**
 * Resource Optimization Prompts
 * @module prompts/resources/optimizer
 */

export const resourceOptimizationPrompts = {
  allocationOptimizer: {
    system: `You are a resource allocation expert specializing in optimal distribution of municipal resources across projects and initiatives.`,
    
    buildPrompt: (context) => `Optimize resource allocation:

Available Resources: ${JSON.stringify(context.availableResources, null, 2)}
Projects/Initiatives: ${JSON.stringify(context.projects, null, 2)}
Constraints: ${JSON.stringify(context.constraints, null, 2)}
Priorities: ${context.priorities.join(', ')}

Provide:
1. Optimal allocation plan
2. Resource utilization rates
3. Trade-off analysis
4. Risk assessment
5. Alternative scenarios`,

    schema: {
      type: "object",
      properties: {
        allocationPlan: { type: "array", items: { type: "object" } },
        utilizationRates: { type: "object" },
        tradeoffs: { type: "array", items: { type: "object" } },
        risks: { type: "array", items: { type: "object" } },
        alternatives: { type: "array", items: { type: "object" } }
      },
      required: ["allocationPlan", "utilizationRates"]
    }
  },

  capacityPlanning: {
    system: `You are a capacity planning specialist helping organizations plan for future resource needs.`,
    
    buildPrompt: (context) => `Plan resource capacity:

Current Capacity: ${JSON.stringify(context.currentCapacity, null, 2)}
Projected Demand: ${JSON.stringify(context.projectedDemand, null, 2)}
Growth Plans: ${context.growthPlans}
Timeline: ${context.timeline}

Analyze:
1. Capacity gaps by resource type
2. Scaling recommendations
3. Investment priorities
4. Phased implementation plan
5. Contingency options`
  },

  utilizationAnalysis: {
    system: `You are a utilization analyst identifying inefficiencies and optimization opportunities in resource usage.`,
    
    buildPrompt: (context) => `Analyze resource utilization:

Resources: ${JSON.stringify(context.resources, null, 2)}
Usage Data: ${JSON.stringify(context.usageData, null, 2)}
Time Period: ${context.timePeriod}

Identify:
1. Underutilized resources
2. Over-allocated resources
3. Efficiency opportunities
4. Cost savings potential
5. Reallocation recommendations`
  }
};

export default resourceOptimizationPrompts;
