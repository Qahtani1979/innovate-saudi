/**
 * Portfolio Optimizer AI Prompt
 * Recommends pilot acceleration, pausing, or termination for optimal resource allocation
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields, scoreField } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generate portfolio optimization prompt
 * @param {Array} pilots - List of active pilots
 * @param {Object} relatedEntities - Related entity details
 * @returns {string} Complete prompt
 */
export function getPortfolioOptimizerPrompt(pilots, relatedEntities = {}) {
  const activePilots = pilots?.filter(p => ['active', 'preparation', 'approved'].includes(p.stage)) || [];
  
  const pilotSummaries = activePilots.slice(0, 15).map(p => `
PILOT: ${p.title_en || p.title_ar || 'Untitled'}
- Sector: ${p.sector || 'Not specified'}
- Municipality: ${p.municipality_id || 'National'}
- Budget: ${p.budget?.toLocaleString() || 0} SAR
- Success Probability: ${p.success_probability || 'N/A'}%
- Stage: ${p.stage}
- Risk Level: ${p.risk_level || 'Not assessed'}
- KPIs Defined: ${p.kpis?.length || 0}
- Start Date: ${p.start_date || 'TBD'}
- Duration: ${p.duration_months || 'TBD'} months`).join('\n');

  return `${SAUDI_CONTEXT.FULL}

${SAUDI_CONTEXT.INNOVATION}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

PILOT PORTFOLIO OPTIMIZATION FOR MoMAH:

You are analyzing ${activePilots.length} active/approved pilots for optimal resource allocation.

CURRENT PILOTS:
${pilotSummaries}

${relatedEntities.challenges ? `
RELATED CHALLENGES: ${relatedEntities.challenges.length} challenges feeding into pilots
` : ''}

${relatedEntities.budgets ? `
AVAILABLE BUDGET: ${relatedEntities.budgets.total?.toLocaleString() || 'Not specified'} SAR
` : ''}

OPTIMIZATION CRITERIA:
1. Vision 2030 strategic alignment
2. Expected national impact and scalability
3. Risk-adjusted return on investment
4. Resource efficiency and synergies
5. Sector diversity and geographic coverage

PROVIDE RECOMMENDATIONS:

1. ACCELERATE (High impact, manageable risk, strategic priority):
   - Which pilots should receive additional resources?
   - What specific acceleration actions?

2. PAUSE (Low success probability, needs reassessment):
   - Which pilots should temporarily pause?
   - What alternatives or pivots to consider?

3. TERMINATE (Critical issues, no viable path forward):
   - Which pilots should be discontinued?
   - Clear rationale for stakeholder communication

4. RESOURCE REBALANCING:
   - Budget reallocation suggestions
   - Team capacity optimization
   - Cross-pilot synergy opportunities

5. PORTFOLIO HEALTH SCORE (0-100):
   - Based on diversity, pipeline health, and risk exposure

CRITICAL: All text must be bilingual. Provide actionable, specific recommendations.`;
}

/**
 * Portfolio optimizer response schema
 */
export const portfolioOptimizerSchema = {
  type: 'object',
  properties: {
    accelerate: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pilot_title: { type: 'string' },
          ...flatBilingualFields('rationale', 'Why this pilot should be accelerated'),
          ...flatBilingualFields('action', 'Specific acceleration action'),
          additional_budget: { type: 'number', description: 'Recommended additional budget in SAR' },
          expected_impact_increase: scoreField(0, 100)
        },
        required: ['pilot_title', 'rationale_en', 'rationale_ar', 'action_en', 'action_ar']
      }
    },
    pause: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pilot_title: { type: 'string' },
          ...flatBilingualFields('rationale', 'Why this pilot should be paused'),
          ...flatBilingualFields('alternative', 'Suggested pivot or alternative approach'),
          review_timeline_weeks: { type: 'number', description: 'Weeks until review' }
        },
        required: ['pilot_title', 'rationale_en', 'rationale_ar', 'alternative_en', 'alternative_ar']
      }
    },
    terminate: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pilot_title: { type: 'string' },
          ...flatBilingualFields('rationale', 'Clear rationale for termination'),
          salvageable_learnings_en: { type: 'string' },
          salvageable_learnings_ar: { type: 'string' }
        },
        required: ['pilot_title', 'rationale_en', 'rationale_ar']
      }
    },
    rebalancing_suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...flatBilingualFields('suggestion', 'Resource rebalancing suggestion'),
          category: { type: 'string', enum: ['budget', 'team', 'synergy', 'timeline'] },
          estimated_savings_sar: { type: 'number' }
        },
        required: ['suggestion_en', 'suggestion_ar', 'category']
      }
    },
    portfolio_health_score: scoreField(0, 100),
    optimization_summary_en: { type: 'string', description: 'Executive summary (English)' },
    optimization_summary_ar: { type: 'string', description: 'Executive summary (Arabic)' }
  },
  required: ['accelerate', 'pause', 'terminate', 'rebalancing_suggestions', 'portfolio_health_score']
};

export default { getPortfolioOptimizerPrompt, portfolioOptimizerSchema };
