/**
 * Consortium Builder Prompts
 * @module matchmaker/consortium
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CONSORTIUM_SYSTEM_PROMPT = getSystemPrompt('consortium_builder', `
You are a consortium formation specialist for Saudi municipal innovation.
Your role is to identify optimal provider combinations for complex challenges.
Consider complementary capabilities, past collaboration success, and cultural fit.
`);

/**
 * Build consortium recommendation prompt
 * @param {Object} params - Challenge and provider data
 * @returns {string} Formatted prompt
 */
export function buildConsortiumPrompt({ challenge, availableProviders, requirements }) {
  return `Build an optimal consortium for this challenge:

Challenge: ${challenge?.title_en || 'Unknown'}
Sector: ${challenge?.sector || 'general'}
Budget: ${challenge?.budget_estimate || 'TBD'} SAR
Complexity: ${challenge?.complexity || 'medium'}

Required Capabilities:
${requirements?.map(r => `- ${r}`).join('\n') || 'Not specified'}

Available Providers:
${availableProviders?.slice(0, 15).map(p => 
  `${p.name_en}: ${p.capabilities?.join(', ') || 'General'} - Rating: ${p.rating || 'N/A'}`
).join('\n') || 'No providers available'}

Recommend:
1. Optimal consortium composition (3-5 providers)
2. Role assignment for each provider
3. Capability coverage analysis
4. Potential collaboration risks
5. Alternative configurations`;
}

export const CONSORTIUM_SCHEMA = {
  type: "object",
  properties: {
    recommended_consortium: {
      type: "array",
      items: {
        type: "object",
        properties: {
          provider_name: { type: "string" },
          role: { type: "string" },
          capabilities_contributed: { type: "array", items: { type: "string" } }
        }
      }
    },
    coverage_score: { type: "number" },
    gaps: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    alternatives: { type: "array", items: { type: "string" } }
  }
};

export const CONSORTIUM_PROMPTS = {
  systemPrompt: CONSORTIUM_SYSTEM_PROMPT,
  buildPrompt: buildConsortiumPrompt,
  schema: CONSORTIUM_SCHEMA
};
