/**
 * Adaptive Pilot Management Prompts
 * @module pilots/adaptiveManagement
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ADAPTIVE_MANAGEMENT_SYSTEM_PROMPT = getSystemPrompt('adaptive_management', `
You are an expert in adaptive management for municipal innovation pilots in Saudi Arabia.
Your role is to analyze pilot progress, identify issues, and recommend course corrections.
Provide actionable adjustments aligned with Vision 2030 innovation goals.
`);

/**
 * Build adaptive management analysis prompt
 * @param {Object} params - Pilot and progress metrics
 * @returns {string} Formatted prompt
 */
export function buildAdaptiveManagementPrompt({ pilot, velocity, completedMilestones, totalMilestones }) {
  return `Pilot adaptive management analysis:

PILOT: ${pilot.title_en}
PROGRESS: ${completedMilestones}/${totalMilestones} milestones (${velocity}%)
TIMELINE: ${pilot.duration_weeks || 12} weeks planned
BUDGET: ${pilot.budget || 'Not specified'} SAR

MILESTONES STATUS:
${pilot.milestones?.slice(0, 5).map(m => `${m.name}: ${m.status}`).join('\n') || 'No milestones defined'}

Velocity is ${velocity < 80 ? 'BELOW' : 'ON'} target.

Recommend:
1. Should we adjust scope, timeline, or resources?
2. Specific changes to milestones
3. Resource reallocation suggestions
4. Impact assessment of changes
5. Risk mitigation`;
}

export const ADAPTIVE_MANAGEMENT_SCHEMA = {
  type: 'object',
  properties: {
    recommendation_type: { 
      type: 'string',
      enum: ['continue_as_planned', 'reduce_scope', 'extend_timeline', 'add_resources', 'pivot_approach']
    },
    rationale: { type: 'string' },
    proposed_changes: { type: 'array', items: { type: 'string' } },
    impact_assessment: { type: 'string' },
    new_velocity_estimate: { type: 'number' },
    risks: { type: 'array', items: { type: 'string' } }
  },
  required: ['recommendation_type', 'rationale', 'proposed_changes']
};

// Legacy exports for backwards compatibility
export const createAdaptiveAdjustmentPrompt = buildAdaptiveManagementPrompt;
export const ADAPTIVE_ADJUSTMENT_SCHEMA = ADAPTIVE_MANAGEMENT_SCHEMA;

export const ADAPTIVE_MANAGEMENT_PROMPTS = {
  systemPrompt: ADAPTIVE_MANAGEMENT_SYSTEM_PROMPT,
  buildPrompt: buildAdaptiveManagementPrompt,
  schema: ADAPTIVE_MANAGEMENT_SCHEMA
};
