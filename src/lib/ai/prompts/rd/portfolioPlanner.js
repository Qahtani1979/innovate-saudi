/**
 * R&D portfolio planning prompts
 * @module rd/portfolioPlanner
 */

export const RD_PORTFOLIO_SYSTEM_PROMPT = `You are an expert in R&D portfolio management and strategic planning for Saudi municipal innovation aligned with Vision 2030.`;

export const createRDPortfolioPlanPrompt = (currentState) => `Create a strategic R&D portfolio plan for Saudi municipal innovation:

Current State:
- Active Projects: ${currentState.activeProjects || 0}
- Total Budget: ${currentState.totalBudget || 'N/A'} SAR
- Sectors Covered: ${currentState.sectors?.join(', ') || 'N/A'}
- Completion Rate: ${currentState.completionRate || 'N/A'}%
- Average Duration: ${currentState.avgDuration || 'N/A'} months

Provide portfolio plan in BOTH English AND Arabic:
1. Portfolio Assessment
2. Gap Analysis
3. Strategic Priorities
4. Investment Recommendations
5. Risk Diversification Strategy
6. Timeline for New Initiatives`;

export const RD_PORTFOLIO_SCHEMA = {
  type: 'object',
  properties: {
    portfolio_assessment_en: { type: 'string' },
    portfolio_assessment_ar: { type: 'string' },
    gaps_identified: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gap_en: { type: 'string' },
          gap_ar: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    strategic_priorities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          priority_en: { type: 'string' },
          priority_ar: { type: 'string' },
          budget_allocation: { type: 'number' },
          timeline: { type: 'string' }
        }
      }
    },
    investment_recommendations_en: { type: 'array', items: { type: 'string' } },
    investment_recommendations_ar: { type: 'array', items: { type: 'string' } },
    risk_strategy_en: { type: 'string' },
    risk_strategy_ar: { type: 'string' }
  }
};
