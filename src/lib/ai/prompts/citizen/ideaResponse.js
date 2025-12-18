/**
 * Challenge Idea Response Prompt Module
 * Citizen proposal generation for municipal challenges
 * @module prompts/citizen/ideaResponse
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Schema for proposal generation response
 */
export const IDEA_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    implementation_plan: { type: 'string' },
    expected_outcomes: { type: 'string' },
    resources_needed: { type: 'string' },
    team_description: { type: 'string' },
    budget_estimate: { type: 'number' },
    timeline_proposal: { type: 'string' }
  }
};

/**
 * Citizen proposal generation prompt template
 * @param {Object} context - Challenge and idea context
 * @returns {string} Formatted prompt
 */
export function IDEA_RESPONSE_PROMPT_TEMPLATE(context) {
  const { challenge, initialDescription } = context;
  
  return `You are helping a citizen create a formal innovation proposal for a municipal challenge.

${SAUDI_CONTEXT}

CHALLENGE CONTEXT:
Title: ${challenge.title_en}
${challenge.title_ar ? `Arabic Title: ${challenge.title_ar}` : ''}
Description: ${challenge.description_en}
Desired Outcome: ${challenge.desired_outcome_en || 'Not specified'}
Sector: ${challenge.sector || 'General'}
KPIs: ${JSON.stringify(challenge.kpis || [])}

USER'S INITIAL IDEA:
${initialDescription}

Generate a comprehensive innovation proposal with:
1. Professional title (EN & AR) - Clear, descriptive proposal title
2. Detailed description (EN & AR, 200+ words) - Explain the proposed solution approach
3. Implementation plan - Step-by-step phases with timeline
4. Expected outcomes - Measurable benefits aligned with challenge KPIs
5. Resources needed - What would be required
6. Team requirements - Skills/expertise needed
7. Budget estimate (SAR) - Rough cost estimate
8. Timeline - Realistic duration

Make the proposal professional but accessible to non-technical reviewers.
Focus on HOW the idea solves the challenge, not just WHAT it is.`;
}

/**
 * Idea response system prompt
 */
export const IDEA_RESPONSE_SYSTEM_PROMPT = `You are an expert innovation consultant helping Saudi citizens transform their ideas into professional municipal innovation proposals.

Your role is to:
- Transform raw citizen ideas into structured, professional proposals
- Ensure proposals align with challenge requirements and KPIs
- Provide realistic budget and timeline estimates for Saudi context
- Make proposals accessible to both technical and non-technical reviewers
- Maintain bilingual (English/Arabic) quality throughout`;

export default {
  IDEA_RESPONSE_PROMPT_TEMPLATE,
  IDEA_RESPONSE_SCHEMA,
  IDEA_RESPONSE_SYSTEM_PROMPT
};
