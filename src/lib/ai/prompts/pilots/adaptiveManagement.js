/**
 * Adaptive pilot management prompts
 * @module pilots/adaptiveManagement
 */

export const ADAPTIVE_MANAGEMENT_SYSTEM_PROMPT = `You are an expert in adaptive management for municipal innovation pilots in Saudi Arabia.`;

export const createAdaptiveAdjustmentPrompt = (pilot, metrics) => `Analyze pilot and suggest adaptive adjustments:

Pilot: ${pilot.title_en}
Status: ${pilot.status}
Progress: ${metrics.completedMilestones}/${metrics.totalMilestones} milestones
Velocity: ${metrics.velocity}%
Budget Utilization: ${metrics.budgetUtilization}%
Timeline Status: ${metrics.timelineStatus}

Provide adaptive management recommendations:
1. Course corrections needed
2. Resource reallocation suggestions
3. Timeline adjustments
4. Stakeholder communication updates
5. Risk mitigation actions`;

export const ADAPTIVE_ADJUSTMENT_SCHEMA = {
  type: 'object',
  properties: {
    course_corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string' },
          current_state: { type: 'string' },
          recommended_action_en: { type: 'string' },
          recommended_action_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    },
    resource_suggestions_en: { type: 'array', items: { type: 'string' } },
    resource_suggestions_ar: { type: 'array', items: { type: 'string' } },
    timeline_adjustments: { type: 'string' },
    communication_updates: { type: 'array', items: { type: 'string' } },
    risk_actions: { type: 'array', items: { type: 'string' } }
  }
};
