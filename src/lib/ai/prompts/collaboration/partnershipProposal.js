/**
 * Partnership Proposal Prompts
 * @module collaboration/partnershipProposal
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PARTNERSHIP_PROPOSAL_SYSTEM_PROMPT = getSystemPrompt('partnership_proposal', `
You are a partnership development specialist for Saudi municipal innovation.
Your role is to create professional partnership proposals with clear objectives and KPIs.
Focus on governance structures, milestones, and mutual value creation.
`);

/**
 * Build partnership proposal prompt
 * @param {Object} params - Partnership data
 * @returns {string} Formatted prompt
 */
export function buildPartnershipProposalPrompt({ partnership_type, partner_organization, proposal_title, objectives }) {
  return `Generate a professional partnership proposal draft:

Type: ${partnership_type || 'Not specified'}
Partner: ${partner_organization || 'Not specified'}
Title: ${proposal_title || 'Not specified'}
Objectives: ${objectives || 'Not specified'}

Create a structured proposal with:
1. Executive summary
2. Partnership scope and objectives
3. Expected outcomes and KPIs
4. Governance structure
5. Timeline and milestones`;
}

export const PARTNERSHIP_PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    detailed_scope: { type: "string" },
    kpis: { type: "array", items: { type: "string" } },
    governance: { type: "string" },
    milestones: { type: "array", items: { type: "string" } }
  }
};

export const PARTNERSHIP_PROPOSAL_PROMPTS = {
  systemPrompt: PARTNERSHIP_PROPOSAL_SYSTEM_PROMPT,
  buildPrompt: buildPartnershipProposalPrompt,
  schema: PARTNERSHIP_PROPOSAL_SCHEMA
};
