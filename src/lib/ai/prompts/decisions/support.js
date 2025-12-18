/**
 * Decision Support Prompts
 * @module prompts/decisions/support
 */

export const decisionSupportPrompts = {
  prioritization: {
    system: `You are a decision support specialist helping prioritize initiatives based on multiple criteria.`,
    
    buildPrompt: (context) => `Prioritize initiatives:

Items to Prioritize: ${JSON.stringify(context.items, null, 2)}
Criteria: ${JSON.stringify(context.criteria, null, 2)}
Constraints: ${context.constraints.join(', ')}
Strategic Goals: ${context.strategicGoals.join(', ')}

Provide:
1. Ranked priority list
2. Scoring breakdown
3. Trade-off analysis
4. Quick wins identification
5. Implementation sequencing`,

    schema: {
      type: "object",
      properties: {
        rankedList: { type: "array", items: { type: "object" } },
        scoringMatrix: { type: "object" },
        tradeoffs: { type: "array", items: { type: "object" } },
        quickWins: { type: "array", items: { type: "string" } },
        sequencing: { type: "array", items: { type: "object" } }
      },
      required: ["rankedList", "scoringMatrix"]
    }
  },

  scenarioAnalysis: {
    system: `You are a scenario planning expert helping evaluate different courses of action.`,
    
    buildPrompt: (context) => `Analyze decision scenarios:

Decision: ${context.decisionDescription}
Options: ${JSON.stringify(context.options, null, 2)}
Uncertainties: ${context.uncertainties.join(', ')}
Success Criteria: ${context.successCriteria.join(', ')}

Evaluate:
1. Scenario outcomes
2. Probability assessments
3. Risk-reward profiles
4. Sensitivity analysis
5. Recommended option with rationale`
  },

  tradeoffAnalysis: {
    system: `You are a trade-off analyst helping balance competing objectives and constraints.`,
    
    buildPrompt: (context) => `Analyze trade-offs:

Objectives: ${JSON.stringify(context.objectives, null, 2)}
Resources: ${JSON.stringify(context.resources, null, 2)}
Constraints: ${context.constraints.join(', ')}

Determine:
1. Trade-off matrix
2. Pareto optimal solutions
3. Compromise options
4. Stakeholder impact
5. Recommended balance`
  }
};

export default decisionSupportPrompts;
