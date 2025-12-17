/**
 * Partnership network prompts
 * @module strategy/partnership
 */

export const PARTNERSHIP_NETWORK_SYSTEM_PROMPT = `You are an expert in Saudi municipal innovation partnerships and collaboration opportunities. Suggest strategic partnerships aligned with Vision 2030.`;

export const createPartnershipSuggestionsPrompt = (networkData) => `Analyze partnership network for Saudi municipal innovation and suggest new collaboration opportunities:

Current Network:
- Organizations: ${networkData.organizationCount}
- Active Collaborations: ${networkData.collaborationCount}
- Pilots: ${networkData.pilotCount}
- R&D Projects: ${networkData.rdProjectCount}

Suggest 5 specific partnership opportunities in format:
"[Org A] + [Org B] could collaborate on [Challenge/Opportunity]"`;

export const PARTNERSHIP_SUGGESTIONS_SCHEMA = {
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
  }
};
