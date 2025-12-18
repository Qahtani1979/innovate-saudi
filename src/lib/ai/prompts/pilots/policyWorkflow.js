/**
 * Pilot to Policy Workflow Prompts
 * For generating policy recommendations from pilot results
 * @module prompts/pilots/policyWorkflow
 */

export const POLICY_WORKFLOW_SYSTEM_PROMPT = `You are a policy advisor for Saudi government innovation initiatives.
Generate evidence-based policy recommendations from pilot program results.
Create bilingual content (Arabic and English) with clear rationale.`;

export const buildPolicyWorkflowPrompt = ({ pilot }) => {
  return `Based on this pilot's results, generate policy recommendations:

Pilot: ${pilot.title_en || 'Untitled'}
Sector: ${pilot.sector || 'Not specified'}
Municipality: ${pilot.municipality_id || 'N/A'}
Evaluation: ${pilot.evaluation_summary_en || 'In progress'}
Success Probability: ${pilot.success_probability || 'N/A'}%
Lessons: ${pilot.lessons_learned?.map(l => l.lesson).join('; ') || 'N/A'}

Generate bilingual policy recommendation:
1. Policy recommendation (what regulatory/policy change is needed)
2. Rationale (why this policy change, based on pilot evidence)
3. Expected impact

Must be in both Arabic and English.`;
};

export const POLICY_WORKFLOW_SCHEMA = {
  type: 'object',
  properties: {
    recommendation_ar: { type: 'string', description: 'Policy recommendation in Arabic' },
    recommendation_en: { type: 'string', description: 'Policy recommendation in English' },
    rationale_ar: { type: 'string', description: 'Rationale in Arabic' },
    rationale_en: { type: 'string', description: 'Rationale in English' },
    impact_en: { type: 'string', description: 'Expected impact in English' },
    impact_ar: { type: 'string', description: 'Expected impact in Arabic' }
  },
  required: ['recommendation_ar', 'recommendation_en', 'rationale_ar', 'rationale_en']
};

export default {
  system: POLICY_WORKFLOW_SYSTEM_PROMPT,
  buildPrompt: buildPolicyWorkflowPrompt,
  schema: POLICY_WORKFLOW_SCHEMA
};
