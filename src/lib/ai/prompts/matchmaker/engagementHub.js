/**
 * Matchmaker Engagement Hub Prompts
 * @module matchmaker/engagementHub
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ENGAGEMENT_HUB_SYSTEM_PROMPT = getSystemPrompt('engagement_hub', `
You are a partnership proposal specialist for Saudi Arabia's municipal innovation platform.
Your role is to generate professional partnership proposals based on matchmaker applications.
Create compelling, bilingual proposals that highlight mutual benefits and Vision 2030 alignment.
`);

export function buildEngagementProposalPrompt({ application }) {
  return `Generate a partnership proposal template for this Matchmaker application:

Organization: ${application.organization_name_en || application.organization_name}
Interest Type: ${application.interest_type}
Capabilities: ${(application.capabilities || []).join(', ')}
Target Sectors: ${(application.target_sectors || []).join(', ')}
Experience: ${application.experience_description || 'Not specified'}

Generate:
1. Executive summary (EN & AR)
2. Value proposition
3. Proposed collaboration model
4. Key deliverables
5. Success metrics
6. Next steps`;
}

export const ENGAGEMENT_PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    value_proposition: {
      type: 'object',
      properties: {
        for_municipality: { type: 'array', items: { type: 'string' } },
        for_partner: { type: 'array', items: { type: 'string' } }
      }
    },
    collaboration_model: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        structure: { type: 'string' },
        governance: { type: 'string' }
      }
    },
    key_deliverables: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          deliverable: { type: 'string' },
          timeline: { type: 'string' },
          responsible_party: { type: 'string' }
        }
      }
    },
    success_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric: { type: 'string' },
          target: { type: 'string' },
          measurement_method: { type: 'string' }
        }
      }
    },
    next_steps: { type: 'array', items: { type: 'string' } }
  },
  required: ['executive_summary_en', 'executive_summary_ar', 'value_proposition', 'key_deliverables']
};

export const ENGAGEMENT_HUB_PROMPTS = {
  systemPrompt: ENGAGEMENT_HUB_SYSTEM_PROMPT,
  buildPrompt: buildEngagementProposalPrompt,
  schema: ENGAGEMENT_PROPOSAL_SCHEMA
};
