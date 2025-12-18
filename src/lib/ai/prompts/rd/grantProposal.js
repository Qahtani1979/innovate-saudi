/**
 * Grant Proposal Assistance Prompts
 * @module rd/grantProposal
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const GRANT_PROPOSAL_SYSTEM_PROMPT = getSystemPrompt('grant_proposal', `
You are a grant writing specialist for Saudi research and innovation.
Your role is to help researchers craft compelling funding proposals.
Focus on alignment with funding priorities, impact statements, and budget justification.
`);

/**
 * Build grant proposal assistance prompt
 * @param {Object} params - Research and grant context
 * @returns {string} Formatted prompt
 */
export function buildGrantProposalPrompt({ research, grantProgram, researcherProfile }) {
  return `Assist with grant proposal:

Research Project: ${research?.title_en || 'Unknown'}
Research Area: ${research?.area || 'General'}
Requested Amount: ${research?.budget_requested || 'TBD'} SAR

Grant Program: ${grantProgram?.name || 'Unknown'}
Funding Focus: ${grantProgram?.focus_areas?.join(', ') || 'General research'}

Researcher: ${researcherProfile?.name || 'Unknown'}
Track Record: ${researcherProfile?.publications || 0} publications, ${researcherProfile?.grants || 0} previous grants

Generate:
1. Compelling problem statement
2. Alignment with funding priorities
3. Impact statement (bilingual)
4. Budget justification points
5. Risk mitigation strategies
6. Success metrics`;
}

export const GRANT_PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    problem_statement_en: { type: "string" },
    problem_statement_ar: { type: "string" },
    alignment_points: { type: "array", items: { type: "string" } },
    impact_statement_en: { type: "string" },
    impact_statement_ar: { type: "string" },
    budget_justification: { type: "array", items: { type: "string" } },
    risk_mitigation: { type: "array", items: { type: "string" } },
    success_metrics: { type: "array", items: { type: "string" } }
  }
};

export const GRANT_PROPOSAL_PROMPTS = {
  systemPrompt: GRANT_PROPOSAL_SYSTEM_PROMPT,
  buildPrompt: buildGrantProposalPrompt,
  schema: GRANT_PROPOSAL_SCHEMA
};
