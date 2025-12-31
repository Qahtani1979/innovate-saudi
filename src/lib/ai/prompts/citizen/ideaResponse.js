/**
 * Challenge Idea Response Prompt Module
 * Citizen proposal generation for municipal challenges
 * @module prompts/citizen/ideaResponse
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

/**
 * Schema for proposal generation response
 */
export const IDEA_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string', description: 'English proposal title' },
    title_ar: { type: 'string', description: 'Arabic proposal title' },
    description_en: { type: 'string', description: 'English detailed description' },
    description_ar: { type: 'string', description: 'Arabic detailed description' },
    implementation_plan: { type: 'string', description: 'Step-by-step implementation plan' },
    implementation_plan_ar: { type: 'string', description: 'Arabic implementation plan' },
    expected_outcomes: { type: 'string', description: 'Expected outcomes and benefits' },
    expected_outcomes_ar: { type: 'string', description: 'Arabic expected outcomes' },
    resources_needed: { type: 'string', description: 'Required resources' },
    resources_needed_ar: { type: 'string', description: 'Arabic resources needed' },
    team_description: { type: 'string', description: 'Team requirements' },
    team_description_ar: { type: 'string', description: 'Arabic team description' },
    budget_estimate: { type: 'number', description: 'Estimated budget in SAR' },
    timeline_proposal: { type: 'string', description: 'Proposed timeline' },
    timeline_proposal_ar: { type: 'string', description: 'Arabic timeline' }
  },
  required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'implementation_plan', 'expected_outcomes', 'budget_estimate', 'timeline_proposal']
};

/**
 * Citizen proposal generation prompt template
 * @param {Object} context - Challenge and idea context
 * @returns {string} Formatted prompt
 */
export function IDEA_RESPONSE_PROMPT_TEMPLATE(context) {
  const { challenge, initialDescription } = context;
  
  return `You are helping a citizen create a formal innovation proposal for a municipal challenge.

${SAUDI_CONTEXT.MUNICIPAL}

CHALLENGE CONTEXT:
Title: ${challenge.title_en}
${challenge.title_ar ? `Arabic Title: ${challenge.title_ar}` : ''}
Description: ${challenge.description_en}
Desired Outcome: ${challenge.desired_outcome_en || 'Not specified'}
Sector: ${challenge.sector || 'General'}
KPIs: ${JSON.stringify(challenge.kpis || [])}

USER'S INITIAL IDEA:
${initialDescription}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

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
