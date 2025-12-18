/**
 * Provider Collaboration Network Prompts
 * @module solutions/providerCollaboration
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROVIDER_COLLABORATION_SYSTEM_PROMPT = getSystemPrompt('provider_collaboration', `
You are a partnership strategist for Saudi Arabia's municipal innovation solution providers.
Your role is to identify complementary partnership opportunities that create value.
Analyze provider capabilities and market positioning to suggest strategic collaborations.
`);

/**
 * Build provider collaboration analysis prompt
 * @param {Object} params - Provider and solutions data
 * @returns {string} Formatted prompt
 */
export function buildProviderCollaborationPrompt({ currentSolution, potentialPartners, sectorData }) {
  const partnersList = potentialPartners?.slice(0, 15).map(p => 
    `- ${p.name_en}: ${p.sector}, Capabilities: ${p.capabilities?.slice(0, 3).join(', ') || 'N/A'}`
  ).join('\n') || 'No potential partners';

  return `Analyze complementary partnership opportunities for this provider:

Provider Solution: ${currentSolution?.name_en || 'Unknown'}
Sector: ${currentSolution?.sector || 'N/A'}
Capabilities: ${currentSolution?.capabilities?.join(', ') || 'N/A'}
Target Municipalities: ${currentSolution?.target_municipalities || 'All'}

POTENTIAL PARTNERS:
${partnersList}

SECTOR CONTEXT:
${JSON.stringify(sectorData || {}, null, 2)}

Identify:
1. Complementary capabilities that fill gaps
2. Joint value propositions
3. Partnership models (JV, referral, integration)
4. Market expansion opportunities
5. Risk considerations`;
}

export const PROVIDER_COLLABORATION_SCHEMA = {
  type: "object",
  properties: {
    recommended_partners: {
      type: "array",
      items: {
        type: "object",
        properties: {
          partner_id: { type: "string" },
          partner_name: { type: "string" },
          compatibility_score: { type: "number", minimum: 0, maximum: 100 },
          complementary_capabilities: { type: "array", items: { type: "string" } },
          partnership_model: { type: "string" },
          rationale: { type: "string" }
        }
      }
    },
    joint_value_propositions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          proposition: { type: "string" },
          target_segment: { type: "string" },
          competitive_advantage: { type: "string" }
        }
      }
    },
    market_opportunities: {
      type: "array",
      items: { type: "string" }
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    }
  },
  required: ["recommended_partners", "joint_value_propositions"]
};

export const PROVIDER_COLLABORATION_PROMPTS = {
  systemPrompt: PROVIDER_COLLABORATION_SYSTEM_PROMPT,
  buildPrompt: buildProviderCollaborationPrompt,
  schema: PROVIDER_COLLABORATION_SCHEMA
};
