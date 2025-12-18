/**
 * Strategic Plan Approval Gate Prompts
 * @module gates/strategicApproval
 */

export const STRATEGIC_APPROVAL_SYSTEM_PROMPT = `You are a strategic planning expert for Saudi municipal innovation. Generate executive decision briefs that help leadership make informed approval decisions on strategic plans.`;

export const buildStrategicApprovalPrompt = (plan) => `Analyze this strategic plan and provide executive decision brief in BOTH English and Arabic:

Plan: ${plan.name_en}
Vision: ${plan.vision_en || 'N/A'}
Mission: ${plan.mission_en || 'N/A'}
Start: ${plan.start_date}
End: ${plan.end_date}
Status: ${plan.status}
Budget: ${plan.total_budget || 'Not specified'}

Objectives: ${plan.objectives?.length || 0}
Initiatives: ${plan.initiatives?.length || 0}
KPIs: ${plan.kpis?.length || 0}

Provide:
1. Executive Summary (2-3 sentences)
2. Key Strengths (3-5 points)
3. Risk Assessment
4. Approval Recommendation
5. Conditions for Approval (if any)`;

export const STRATEGIC_APPROVAL_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          point_en: { type: 'string' },
          point_ar: { type: 'string' }
        }
      }
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' }
        }
      }
    },
    recommendation: {
      type: 'string',
      enum: ['approve', 'approve_with_conditions', 'defer', 'reject']
    },
    recommendation_reason_en: { type: 'string' },
    recommendation_reason_ar: { type: 'string' },
    conditions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          condition_en: { type: 'string' },
          condition_ar: { type: 'string' }
        }
      }
    }
  },
  required: ['executive_summary_en', 'executive_summary_ar', 'recommendation']
};
