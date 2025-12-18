/**
 * Matchmaker Engagement Hub Prompts
 * @module matchmaker/engagementHub
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ENGAGEMENT_HUB_SYSTEM_PROMPT = getSystemPrompt('engagement_hub', `
You are a partnership proposal specialist for Saudi Arabia's municipal innovation platform.
Your role is to generate professional partnership proposals based on matchmaker applications.
Create compelling, bilingual proposals that highlight mutual benefits and Vision 2030 alignment.
`);

/**
 * Build engagement proposal prompt
 * @param {Object} params - Application details
 * @returns {string} Formatted prompt
 */
export function buildEngagementProposalPrompt({ application }) {
  return `Generate a partnership proposal template for this Matchmaker application:

Organization: ${application.organization_name_en || application.organization_name}
Sectors: ${application.sectors?.join(', ') || 'Not specified'}
Collaboration Approach: ${application.collaboration_approach || 'Not specified'}

Generate professional proposal in both English and Arabic with:
1. Executive summary
2. Organization overview
3. Proposed collaboration model
4. Value proposition for municipalities
5. Implementation timeline
6. Success metrics
7. Next steps`;
}

export const ENGAGEMENT_PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    collaboration_model_en: { type: 'string' },
    collaboration_model_ar: { type: 'string' },
    timeline: { type: 'string' },
    success_metrics: { type: 'array', items: { type: 'string' } }
  },
  required: ['executive_summary_en', 'executive_summary_ar']
};

export const ENGAGEMENT_HUB_PROMPTS = {
  systemPrompt: ENGAGEMENT_HUB_SYSTEM_PROMPT,
  buildPrompt: buildEngagementProposalPrompt,
  schema: ENGAGEMENT_PROPOSAL_SCHEMA
};
