/**
 * Lab Policy Evidence Workflow Prompts
 * @module livinglab/policyEvidence
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const POLICY_EVIDENCE_SYSTEM_PROMPT = getSystemPrompt('policy_evidence', `
You are a policy recommendation specialist for Saudi Arabia's municipal living labs.
Your role is to generate evidence-based policy recommendations from citizen science findings.
Synthesize participatory data into actionable policy insights aligned with Vision 2030.
`);

/**
 * Build policy evidence prompt from living lab data
 * @param {Object} params - Living lab details
 * @returns {string} Formatted prompt
 */
export function buildPolicyEvidencePrompt({ livingLab }) {
  return `Generate a policy recommendation based on citizen science findings from this living lab.

Living Lab: ${livingLab.name_en}
Research Focus: ${livingLab.research_focus_areas?.join(', ') || 'N/A'}
Active Projects: ${livingLab.active_projects_count || 0}
Key Findings: ${livingLab.research_outputs?.map(o => o.summary).join('; ') || 'N/A'}
Citizen Feedback: ${livingLab.citizen_feedback_summary || 'N/A'}

Generate a policy recommendation based on citizen evidence with:
1. Title (EN + AR)
2. Evidence summary from citizen participation
3. Policy problem identified
4. Recommended policy changes
5. Expected citizen impact
6. Implementation steps

Return as JSON.`;
}

export const POLICY_EVIDENCE_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    evidence_summary_en: { type: 'string' },
    evidence_summary_ar: { type: 'string' },
    problem_statement_en: { type: 'string' },
    problem_statement_ar: { type: 'string' },
    recommended_changes: { type: 'array', items: { type: 'string' } },
    citizen_impact_en: { type: 'string' },
    citizen_impact_ar: { type: 'string' },
    implementation_steps: { type: 'array', items: { type: 'string' } }
  },
  required: ['title_en', 'title_ar', 'evidence_summary_en', 'recommended_changes']
};

export const POLICY_EVIDENCE_PROMPTS = {
  systemPrompt: POLICY_EVIDENCE_SYSTEM_PROMPT,
  buildPrompt: buildPolicyEvidencePrompt,
  schema: POLICY_EVIDENCE_SCHEMA
};
