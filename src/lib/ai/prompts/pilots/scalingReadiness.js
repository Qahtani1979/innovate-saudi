/**
 * Scaling Readiness Assessment AI Prompt
 * Assesses pilot readiness across multiple dimensions
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generates prompt for scaling readiness assessment
 * @param {Object} pilot - Pilot data
 * @returns {string} Formatted prompt
 */
export function getScalingReadinessPrompt(pilot) {
  return `${SAUDI_CONTEXT.MUNICIPAL}

Assess scaling readiness for this pilot.

PILOT DETAILS:
- Title: ${pilot.title_en}
- Success Criteria Met: ${pilot.success_criteria?.filter(c => c.met).length || 0}/${pilot.success_criteria?.length || 0}
- Budget: ${pilot.budget} SAR
- Team Size: ${pilot.team?.length || 0}
- KPI Achievement: ${pilot.kpis?.filter(k => k.status === 'achieved').length || 0}/${pilot.kpis?.length || 0}

Assess readiness across 5 DIMENSIONS (score 0-100 each):

1. OPERATIONAL: Processes documented, team trained, systems ready
2. FINANCIAL: Cost model validated, funding secured, ROI proven
3. STAKEHOLDER: Buy-in from leadership, user acceptance, partner commitment
4. REGULATORY: Approvals obtained, compliance verified, exemptions secured
5. TECHNICAL: Solution stable, scalable architecture, integration ready

For each gap found, provide:
- The dimension affected
- Description of the gap
- Severity level (critical, high, medium, low)

Generate action plan with:
- Specific actions to close gaps
- Priority level
- Timeline estimate
- Expected impact`;
}

/**
 * JSON schema for scaling readiness response
 */
export const scalingReadinessSchema = {
  type: 'object',
  properties: {
    dimension_scores: {
      type: 'object',
      properties: {
        operational: { type: 'number' },
        financial: { type: 'number' },
        stakeholder: { type: 'number' },
        regulatory: { type: 'number' },
        technical: { type: 'number' }
      },
      required: ['operational', 'financial', 'stakeholder', 'regulatory', 'technical']
    },
    overall_score: { 
      type: 'number',
      description: 'Overall readiness score 0-100'
    },
    readiness_level: { 
      type: 'string',
      enum: ['optimal', 'ready', 'partially_ready', 'not_ready'],
      description: 'Readiness classification'
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dimension: { type: 'string' },
          gap: { type: 'string' },
          severity: { 
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low']
          }
        },
        required: ['dimension', 'gap', 'severity']
      },
      description: 'Identified gaps'
    },
    action_plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          priority: { type: 'string' },
          timeline: { type: 'string' },
          estimated_impact: { type: 'string' }
        },
        required: ['action', 'priority']
      },
      description: 'Gap-closing actions'
    }
  },
  required: ['dimension_scores', 'overall_score', 'readiness_level', 'gaps', 'action_plan']
};

export default { getScalingReadinessPrompt, scalingReadinessSchema };
