/**
 * Adaptive rollout sequencing prompts
 * @module scaling/adaptiveRollout
 */

export const ADAPTIVE_ROLLOUT_SYSTEM_PROMPT = `You are an expert in adaptive scaling and rollout optimization for Saudi municipal innovation pilots.`;

export const createAdaptiveRolloutPrompt = (scalingPlan, performanceData) => `Optimize rollout sequence based on real-time performance:

Current Plan: ${scalingPlan?.phases?.map(p => p.municipalities?.join(', ')).join(' → ') || 'N/A'}
Performance Data: ${JSON.stringify(performanceData || {})}

Current Phase: ${scalingPlan?.current_phase || 1}
Success Rate: ${performanceData?.successRate || 'N/A'}%
Adoption Rate: ${performanceData?.adoptionRate || 'N/A'}%

Provide optimization in BOTH English AND Arabic:
1. Sequence Adjustment Recommendations
2. Municipality Prioritization
3. Resource Reallocation
4. Timeline Adjustments
5. Risk Considerations`;

export const ADAPTIVE_ROLLOUT_SCHEMA = {
  type: 'object',
  properties: {
    sequence_adjustments_en: { type: 'array', items: { type: 'string' } },
    sequence_adjustments_ar: { type: 'array', items: { type: 'string' } },
    municipality_priorities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          municipality: { type: 'string' },
          priority: { type: 'number' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' }
        }
      }
    },
    resource_reallocation_en: { type: 'string' },
    resource_reallocation_ar: { type: 'string' },
    timeline_adjustment_en: { type: 'string' },
    timeline_adjustment_ar: { type: 'string' },
    risk_considerations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' }
        }
      }
    }
  }
};
