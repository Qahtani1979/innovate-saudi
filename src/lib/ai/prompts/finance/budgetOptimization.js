/**
 * Budget Optimization AI Prompts
 * Centralized prompts for budget analysis and optimization
 * @module finance/budgetOptimization
 */

export const BUDGET_OPTIMIZATION_SYSTEM_PROMPT = `You are an expert financial analyst for Saudi Arabian government innovation initiatives.

OPTIMIZATION FRAMEWORK:
1. Allocation Analysis
   - Current distribution
   - Utilization rates
   - Variance analysis
   - Trend identification

2. Efficiency Assessment
   - Cost-effectiveness
   - Resource optimization
   - Waste identification
   - Savings opportunities

3. Forecasting
   - Spend projections
   - Risk-adjusted forecasts
   - Scenario modeling
   - Contingency planning

4. Recommendations
   - Reallocation suggestions
   - Cost reduction strategies
   - Investment priorities
   - Risk mitigation

CONTEXT:
- Saudi government fiscal policies
- Vision 2030 investment priorities
- Arabic/English bilingual support`;

export const BUDGET_OPTIMIZATION_SCHEMA = {
  type: "object",
  properties: {
    optimization_score: { type: "number" },
    current_utilization: { type: "number" },
    allocation_analysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          allocated: { type: "number" },
          spent: { type: "number" },
          utilization: { type: "number" },
          recommendation: { type: "string" }
        }
      }
    },
    savings_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          potential_savings: { type: "number" },
          action_required: { type: "string" },
          risk_level: { type: "string" }
        }
      }
    },
    reallocation_suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          amount: { type: "number" },
          rationale: { type: "string" }
        }
      }
    },
    forecast: {
      type: "object",
      properties: {
        end_of_period_balance: { type: "number" },
        confidence: { type: "number" },
        risks: { type: "array", items: { type: "string" } }
      }
    }
  },
  required: ["optimization_score", "current_utilization", "allocation_analysis"]
};

export const buildBudgetOptimizationPrompt = (budgetData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Optimize budget allocation:

ENTITY: ${budgetData.entityName || 'Not specified'}
FISCAL YEAR: ${budgetData.fiscalYear || 'Current'}
TOTAL BUDGET: ${budgetData.totalBudget || 0} SAR

CURRENT ALLOCATION:
${budgetData.allocations?.map(a => `- ${a.category}: ${a.allocated} SAR (${a.spent} spent)`).join('\n') || 'Not specified'}

UTILIZATION RATE: ${budgetData.utilizationRate || 0}%
REMAINING: ${budgetData.remaining || 0} SAR

PRIORITIES:
${budgetData.priorities?.map(p => `- ${p}`).join('\n') || 'Not specified'}

Provide comprehensive budget optimization with reallocation recommendations.`;
};

export const BUDGET_OPTIMIZATION_PROMPTS = {
  system: BUDGET_OPTIMIZATION_SYSTEM_PROMPT,
  schema: BUDGET_OPTIMIZATION_SCHEMA,
  buildPrompt: buildBudgetOptimizationPrompt
};

export default BUDGET_OPTIMIZATION_PROMPTS;
