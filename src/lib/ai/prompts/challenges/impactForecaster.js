/**
 * Challenge Impact Forecaster AI Prompt
 * Predicts impact metrics if challenge is resolved
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generates prompt for impact forecasting
 * @param {Object} challenge - Challenge data
 * @returns {string} Formatted prompt
 */
export function getImpactForecasterPrompt(challenge) {
  return `${SAUDI_CONTEXT.MUNICIPAL}

Forecast the impact if this municipal challenge is successfully resolved.

CHALLENGE DETAILS:
- Title: ${challenge.title_en}
- Sector: ${challenge.sector}
- Affected Population: ${challenge.affected_population?.size || 'Unknown'}
- Current Severity Score: ${challenge.severity_score || 'Not scored'}
- Budget Estimate: ${challenge.budget_estimate ? `${challenge.budget_estimate} SAR` : 'Not estimated'}

PREDICT IF RESOLVED:
1. MII IMPACT: Municipal Innovation Index point increase (0-10 scale)
2. COMPLAINT REDUCTION: Percentage decrease in related complaints
3. ANNUAL COST SAVINGS: Estimated savings in SAR
4. CITIZEN SATISFACTION: Improvement percentage
5. CONFIDENCE LEVEL: Your confidence in these predictions (0-100%)
6. ROI ESTIMATE: Cost to solve vs annual value created

Consider Saudi municipal benchmarks:
- Average challenge resolution improves MII by 0.5-2 points
- Successful projects typically achieve 20-40% complaint reduction
- Municipal cost savings range from 500K-50M SAR depending on scope`;
}

/**
 * JSON schema for impact forecast response
 */
export const impactForecasterSchema = {
  type: 'object',
  properties: {
    mii_impact: { 
      type: 'number',
      description: 'MII point increase (0-10)'
    },
    complaint_reduction_percent: { 
      type: 'number',
      description: 'Complaint reduction percentage'
    },
    annual_savings_sar: { 
      type: 'number',
      description: 'Annual savings in SAR'
    },
    satisfaction_improvement: { 
      type: 'number',
      description: 'Satisfaction improvement percentage'
    },
    confidence: { 
      type: 'number',
      description: 'Confidence level 0-100'
    },
    roi_multiple: { 
      type: 'number',
      description: 'ROI multiplier'
    },
    summary: { 
      type: 'string',
      description: 'Summary of forecast'
    },
    comparison: { 
      type: 'string',
      description: 'Comparison to similar challenges'
    }
  },
  required: ['mii_impact', 'complaint_reduction_percent', 'annual_savings_sar', 'confidence', 'summary']
};

export default { getImpactForecasterPrompt, impactForecasterSchema };
