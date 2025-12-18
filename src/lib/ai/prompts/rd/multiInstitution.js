/**
 * Multi-Institution Collaboration Prompts
 * @module rd/multiInstitution
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MULTI_INSTITUTION_SYSTEM_PROMPT = getSystemPrompt('multi_institution', `
You are a research collaboration specialist for Saudi municipal innovation.
Your role is to identify optimal research institution partners for collaborative projects.
Consider expertise alignment, geographic coverage, and Vision 2030 priorities.
`);

/**
 * Build partner finding prompt
 * @param {Object} params - Project needs
 * @returns {string} Formatted prompt
 */
export function buildMultiInstitutionPrompt({ projectNeeds }) {
  return `Suggest research institution partners for multi-institution collaboration:

Project needs: ${projectNeeds || 'Advanced AI research, smart city deployment expertise, civic tech experience'}

Consider:
- Saudi universities with relevant research programs
- International institutions with Saudi partnerships
- Industry research labs
- Government research centers

Provide partner suggestions with rationale and collaboration potential.`;
}

export const MULTI_INSTITUTION_SCHEMA = {
  type: "object",
  properties: {
    partners: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution_name: { type: "string" },
          expertise: { type: "string" },
          collaboration_potential: { type: "string" },
          rationale: { type: "string" }
        }
      }
    },
    collaboration_model: { type: "string" },
    success_factors: { type: "array", items: { type: "string" } }
  }
};

export const MULTI_INSTITUTION_PROMPTS = {
  systemPrompt: MULTI_INSTITUTION_SYSTEM_PROMPT,
  buildPrompt: buildMultiInstitutionPrompt,
  schema: MULTI_INSTITUTION_SCHEMA
};
