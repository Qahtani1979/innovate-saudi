/**
 * PESTEL Analysis Prompts
 * @module strategy/pestel
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PESTEL_SYSTEM_PROMPT = getSystemPrompt('pestel_analysis', `
You are a strategic analyst specializing in PESTEL analysis for Saudi municipal innovation.
Your role is to analyze political, economic, social, technological, environmental, and legal factors.
Align all analysis with Vision 2030 and local governance requirements.
`);

/**
 * Build PESTEL analysis prompt
 * @param {Object} params - Strategic context
 * @returns {string} Formatted prompt
 */
export function buildPestelPrompt({ strategicContext, sector, municipality }) {
  return `Perform comprehensive PESTEL analysis in BOTH English and Arabic:

Strategic Context: ${strategicContext || 'Municipal innovation initiative'}
Sector: ${sector || 'General'}
Municipality: ${municipality || 'Not specified'}

Analyze each dimension:
1. Political - governance, policies, regulations
2. Economic - budget, funding, market conditions
3. Social - demographics, cultural factors, public sentiment
4. Technological - infrastructure, digital readiness, innovation capacity
5. Environmental - sustainability, climate, resources
6. Legal - compliance, standards, legal frameworks

For each factor provide:
- Current state assessment
- Impact rating (high/medium/low)
- Strategic implications
- Recommended actions`;
}

export const PESTEL_SCHEMA = {
  type: "object",
  properties: {
    political: {
      type: "object",
      properties: {
        factors_en: { type: "array", items: { type: "string" } },
        factors_ar: { type: "array", items: { type: "string" } },
        impact: { type: "string" },
        implications: { type: "string" }
      }
    },
    economic: {
      type: "object",
      properties: {
        factors_en: { type: "array", items: { type: "string" } },
        factors_ar: { type: "array", items: { type: "string" } },
        impact: { type: "string" },
        implications: { type: "string" }
      }
    },
    social: {
      type: "object",
      properties: {
        factors_en: { type: "array", items: { type: "string" } },
        factors_ar: { type: "array", items: { type: "string" } },
        impact: { type: "string" },
        implications: { type: "string" }
      }
    },
    technological: {
      type: "object",
      properties: {
        factors_en: { type: "array", items: { type: "string" } },
        factors_ar: { type: "array", items: { type: "string" } },
        impact: { type: "string" },
        implications: { type: "string" }
      }
    },
    environmental: {
      type: "object",
      properties: {
        factors_en: { type: "array", items: { type: "string" } },
        factors_ar: { type: "array", items: { type: "string" } },
        impact: { type: "string" },
        implications: { type: "string" }
      }
    },
    legal: {
      type: "object",
      properties: {
        factors_en: { type: "array", items: { type: "string" } },
        factors_ar: { type: "array", items: { type: "string" } },
        impact: { type: "string" },
        implications: { type: "string" }
      }
    },
    summary_en: { type: "string" },
    summary_ar: { type: "string" }
  }
};

export const PESTEL_PROMPTS = {
  systemPrompt: PESTEL_SYSTEM_PROMPT,
  buildPrompt: buildPestelPrompt,
  schema: PESTEL_SCHEMA
};
