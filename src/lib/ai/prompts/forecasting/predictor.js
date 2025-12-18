/**
 * Forecasting and Prediction Prompts
 * @module prompts/forecasting/predictor
 */

export const forecastingPrompts = {
  demandForecasting: {
    system: `You are a demand forecasting expert helping municipalities predict service needs and resource requirements.`,
    
    buildPrompt: (context) => `Forecast demand:

Service/Resource: ${context.serviceName}
Historical Data: ${JSON.stringify(context.historicalData, null, 2)}
External Factors: ${context.externalFactors.join(', ')}
Forecast Horizon: ${context.forecastHorizon}

Provide:
1. Demand projections by period
2. Confidence intervals
3. Seasonal patterns
4. Growth drivers
5. Risk factors`,

    schema: {
      type: "object",
      properties: {
        projections: { type: "array", items: { type: "object" } },
        confidenceLevel: { type: "number" },
        seasonalPatterns: { type: "array", items: { type: "object" } },
        growthDrivers: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "object" } }
      },
      required: ["projections", "confidenceLevel"]
    }
  },

  budgetForecasting: {
    system: `You are a financial forecasting specialist helping plan municipal budgets and expenditures.`,
    
    buildPrompt: (context) => `Forecast budget requirements:

Department/Initiative: ${context.entityName}
Current Budget: ${context.currentBudget}
Historical Spending: ${JSON.stringify(context.historicalSpending, null, 2)}
Planned Activities: ${context.plannedActivities.join(', ')}

Project:
1. Budget needs by category
2. Cost inflation factors
3. Contingency requirements
4. Savings opportunities
5. Funding recommendations`
  },

  outcomeForecasting: {
    system: `You are an outcome prediction specialist helping anticipate project and initiative results.`,
    
    buildPrompt: (context) => `Predict outcomes:

Initiative: ${context.initiativeName}
Current Progress: ${JSON.stringify(context.currentProgress, null, 2)}
Resources Committed: ${context.resources}
Timeline: ${context.timeline}

Forecast:
1. Expected outcomes
2. Success probability
3. Key milestones achievement
4. Risk-adjusted projections
5. Scenario analysis`
  }
};

export default forecastingPrompts;
