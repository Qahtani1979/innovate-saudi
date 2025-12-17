/**
 * Policy executive summary prompts
 * @module policy/executiveSummary
 */

export const POLICY_EXECUTIVE_SUMMARY_SYSTEM_PROMPT = `You are an expert in Saudi policy development and executive briefings. Generate professional Arabic content suitable for ministerial review.`;

export const createPolicyExecutiveSummaryPrompt = (policy) => `Generate an EXECUTIVE POLICY BRIEF in Arabic for senior Saudi leadership (English translation will be auto-generated):

Policy (Arabic): ${policy.title_ar}
Code: ${policy.code || 'N/A'}
Recommendation (Arabic): ${policy.recommendation_text_ar}
Framework: ${policy.regulatory_framework || 'N/A'}
Regulatory Change: ${policy.regulatory_change_needed ? 'Required' : 'Not required'}
Timeline: ${policy.timeline_months || 'TBD'} months
Priority: ${policy.priority_level}
Status: ${policy.workflow_stage || policy.status}

Generate a concise executive brief in ARABIC (max 300 words) covering:
1. **What**: One-sentence policy objective
2. **Why**: Core problem this solves
3. **Impact**: Expected benefits (quantified if possible)
4. **Implementation**: Key steps and timeline
5. **Stakeholders**: Who's involved and affected
6. **Risks**: Main implementation challenges
7. **Decision**: Recommended action for leadership

Format as professional executive brief suitable for ministerial review.`;

export const POLICY_EXECUTIVE_SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    summary_ar: { type: 'string' },
    key_stats: {
      type: 'object',
      properties: {
        timeline: { type: 'string' },
        affected_population: { type: 'string' },
        estimated_impact: { type: 'string' },
        risk_level: { type: 'string' }
      }
    },
    recommendation: { 
      type: 'string',
      enum: ['approve', 'approve_with_conditions', 'defer', 'reject']
    },
    conditions: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};
