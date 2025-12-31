/**
 * Eligibility Check Prompts
 * AI-powered eligibility verification for R&D proposals
 * @version 1.0.0
 */

import { getSystemPrompt, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

/**
 * System prompt for eligibility check
 */
export const ELIGIBILITY_CHECK_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are an expert R&D proposal eligibility evaluator for Saudi municipal innovation.

EVALUATION CRITERIA:
1. Institution eligibility
2. Budget compliance
3. Duration limits
4. PI qualifications
5. Theme alignment
`;

/**
 * Build eligibility check prompt
 * @param {Object} params - Check parameters
 * @returns {string} Formatted prompt
 */
export function buildEligibilityCheckPrompt({ proposal, rdCall }) {
  return `Evaluate R&D proposal eligibility:

Proposal:
- Institution: ${proposal.lead_institution}
- PI: ${proposal.principal_investigator?.name}
- Budget: ${proposal.budget_requested} SAR
- Duration: ${proposal.duration_months} months
- TRL Target: ${proposal.trl_target}

R&D Call Criteria:
- Eligible Institutions: ${rdCall.eligible_institutions?.join(', ') || 'Any'}
- Funding Range: ${rdCall.funding_per_project?.min} - ${rdCall.funding_per_project?.max} SAR
- Max Duration: ${rdCall.max_duration_months || 36} months

Evaluate these criteria:
1. Institution eligibility (pass/fail)
2. Budget within range (pass/fail)
3. Duration acceptable (pass/fail)
4. PI qualifications (pass/fail based on title)
5. Alignment with call themes (pass/fail)

Return structured check results.`;
}

/**
 * Response schema for eligibility check
 */
export const ELIGIBILITY_CHECK_SCHEMA = {
  type: 'object',
  properties: {
    overall_eligible: { type: 'boolean' },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          passed: { type: 'boolean' },
          reason: { type: 'string' }
        },
        required: ['criterion', 'passed', 'reason']
      }
    },
    recommendation: { type: 'string' }
  },
  required: ['overall_eligible', 'checks', 'recommendation']
};
