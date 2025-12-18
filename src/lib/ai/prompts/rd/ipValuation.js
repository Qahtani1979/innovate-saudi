/**
 * IP Value Estimator Prompts
 * @module rd/ipValuation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IP_VALUATION_SYSTEM_PROMPT = getSystemPrompt('ip_valuation', `
You are an intellectual property valuation specialist.
Your role is to estimate the commercial value of research outputs and innovations.
Consider market potential, uniqueness, and commercialization pathways.
`);

/**
 * Build IP valuation prompt
 * @param {Object} params - Research output data
 * @returns {string} Formatted prompt
 */
export function buildIPValuationPrompt({ researchOutput, patents, publications, sector }) {
  return `Estimate IP value for research output:

Research: ${researchOutput?.title_en || 'Unknown'}
Sector: ${sector || 'General'}
TRL Level: ${researchOutput?.trl_level || 'N/A'}

Patents: ${patents?.length || 0} filed
Publications: ${publications?.length || 0} papers

Key Innovations:
${researchOutput?.innovations?.join('\n') || 'Not specified'}

Estimate:
1. Estimated value range (SAR)
2. Commercialization pathways
3. Licensing potential
4. Strategic value factors
5. Risk factors affecting value`;
}

export const IP_VALUATION_SCHEMA = {
  type: "object",
  properties: {
    estimated_value_min: { type: "number" },
    estimated_value_max: { type: "number" },
    commercialization_pathways: { type: "array", items: { type: "string" } },
    licensing_potential: { type: "string" },
    strategic_factors: { type: "array", items: { type: "string" } },
    risk_factors: { type: "array", items: { type: "string" } },
    confidence_level: { type: "string" }
  }
};

export const IP_VALUATION_PROMPTS = {
  systemPrompt: IP_VALUATION_SYSTEM_PROMPT,
  buildPrompt: buildIPValuationPrompt,
  schema: IP_VALUATION_SCHEMA
};
