/**
 * Partnership Network Prompts
 * @module partnerships/network
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PARTNERSHIP_NETWORK_SYSTEM_PROMPT = getSystemPrompt('partnerships_network');

export const buildPartnershipNetworkPrompt = (uniqueOrgs, totalCollaborations, pilots, rdProjects) => `Analyze partnership network for Saudi municipal innovation and suggest new collaboration opportunities:

Current Network:
- Organizations: ${uniqueOrgs.length}
- Active Collaborations: ${totalCollaborations}
- Pilots: ${pilots.length}
- R&D Projects: ${rdProjects.length}

Suggest 5 specific partnership opportunities in format:
"[Org A] + [Org B] could collaborate on [Challenge/Opportunity]"`;

export const PARTNERSHIP_NETWORK_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          partner1: { type: 'string' },
          partner2: { type: 'string' },
          opportunity_en: { type: 'string' },
          opportunity_ar: { type: 'string' },
          rationale_en: { type: 'string' },
          rationale_ar: { type: 'string' }
        }
      }
    }
  },
  required: ['suggestions']
};

export const PARTNERSHIP_NETWORK_PROMPTS = {
  systemPrompt: PARTNERSHIP_NETWORK_SYSTEM_PROMPT,
  buildPrompt: buildPartnershipNetworkPrompt,
  schema: PARTNERSHIP_NETWORK_SCHEMA
};

export default PARTNERSHIP_NETWORK_PROMPTS;
