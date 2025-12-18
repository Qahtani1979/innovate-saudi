/**
 * Match Negotiation Assistance Prompts
 * @module matchmaker/negotiation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const NEGOTIATION_SYSTEM_PROMPT = getSystemPrompt('negotiation', `
You are a negotiation specialist for Saudi municipal innovation matching.
Your role is to facilitate productive negotiations between municipalities and providers.
Focus on win-win solutions, fair pricing, and sustainable partnerships.
`);

/**
 * Build negotiation assistance prompt
 * @param {Object} params - Match and negotiation context
 * @returns {string} Formatted prompt
 */
export function buildNegotiationPrompt({ match, municipalityRequirements, providerCapabilities, stickingPoints }) {
  return `Assist with match negotiation:

Match: ${match?.id || 'Unknown'}
Municipality: ${match?.municipality_name || 'Unknown'}
Provider: ${match?.provider_name || 'Unknown'}

Municipality Requirements:
${municipalityRequirements?.map(r => `- ${r}`).join('\n') || 'Not specified'}

Provider Capabilities:
${providerCapabilities?.map(c => `- ${c}`).join('\n') || 'Not specified'}

Sticking Points:
${stickingPoints?.map(s => `- ${s}`).join('\n') || 'None identified'}

Recommend:
1. Potential compromise positions
2. Value-adds each party can offer
3. Risk-sharing arrangements
4. Success metrics alignment
5. Contract terms suggestions`;
}

export const NEGOTIATION_SCHEMA = {
  type: "object",
  properties: {
    compromises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          suggestion: { type: "string" },
          rationale: { type: "string" }
        }
      }
    },
    municipality_value_adds: { type: "array", items: { type: "string" } },
    provider_value_adds: { type: "array", items: { type: "string" } },
    risk_sharing: { type: "array", items: { type: "string" } },
    success_metrics: { type: "array", items: { type: "string" } },
    contract_suggestions: { type: "array", items: { type: "string" } }
  }
};

export const NEGOTIATION_PROMPTS = {
  systemPrompt: NEGOTIATION_SYSTEM_PROMPT,
  buildPrompt: buildNegotiationPrompt,
  schema: NEGOTIATION_SCHEMA
};
