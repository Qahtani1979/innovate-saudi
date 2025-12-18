/**
 * Budget Management Prompt Module
 * Handles budget analysis and financial planning AI operations
 * @module prompts/resources/budget
 */

export const BUDGET_SYSTEM_PROMPT = `You are an expert in government budget management and financial planning.
Your role is to analyze budgets, forecast spending, and optimize financial resources.

Guidelines:
- Follow Saudi government financial regulations
- Ensure fiscal responsibility
- Align with strategic objectives
- Provide transparent reporting
- Consider multi-year implications`;

export const BUDGET_PROMPTS = {
  analyzeBudget: (budget) => `Analyze this budget:

Budget Name: ${budget.name}
Total Amount: ${budget.totalAmount} SAR
Fiscal Year: ${budget.fiscalYear}
Categories: ${budget.categories?.map(c => `${c.name}: ${c.amount}`).join(', ')}

Provide:
1. Budget health assessment
2. Spending efficiency
3. Risk areas
4. Optimization opportunities
5. Comparison with benchmarks`,

  forecastSpending: (historicalData, projections) => `Forecast spending based on trends:

Historical Spending: ${JSON.stringify(historicalData)}
Known Commitments: ${JSON.stringify(projections)}

Forecast:
1. Monthly spending projections
2. Variance analysis
3. Risk of overrun
4. Savings opportunities
5. Recommendations`,

  optimizeAllocation: (budget, priorities) => `Optimize budget allocation:

Total Budget: ${budget.total} SAR
Current Allocation: ${JSON.stringify(budget.allocation)}
Strategic Priorities: ${priorities.join(', ')}

Recommend:
1. Reallocation suggestions
2. Priority alignment score
3. Trade-off analysis
4. Implementation approach
5. Expected outcomes`
};

export const buildBudgetPrompt = (type, params) => {
  const promptFn = BUDGET_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown budget prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: BUDGET_SYSTEM_PROMPT,
  prompts: BUDGET_PROMPTS,
  build: buildBudgetPrompt
};
