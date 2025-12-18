/**
 * Data Quality Checker Prompts
 * @module data/qualityChecker
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DATA_QUALITY_SYSTEM_PROMPT = getSystemPrompt('data_quality', `
You are a data quality specialist for Saudi Arabia's municipal innovation platform.
Your role is to assess data completeness, consistency, and accuracy.
Identify issues and provide actionable recommendations for data improvement.
Consider Saudi municipal data standards and Vision 2030 requirements.
`);

/**
 * Build data quality check prompt
 * @param {Object} params - Entity and data details
 * @returns {string} Formatted prompt
 */
export function buildDataQualityPrompt({ entityType, data }) {
  const dataPreview = typeof data === 'string' ? data : JSON.stringify(data).substring(0, 1000);
  
  return `Assess data quality for ${entityType}:

DATA: ${dataPreview}

Check:
1. Completeness (% fields filled)
2. Consistency (contradictions, format issues)
3. Accuracy (realistic values, proper ranges)
4. Missing critical fields
5. Data quality score (0-100)
6. Specific issues with recommendations`;
}

export const DATA_QUALITY_SCHEMA = {
  type: "object",
  properties: {
    quality_score: { type: "number", minimum: 0, maximum: 100 },
    completeness: { type: "number", minimum: 0, maximum: 100 },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          issue: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          recommendation: { type: "string" }
        },
        required: ["field", "issue", "severity"]
      }
    },
    strengths: { type: "array", items: { type: "string" } }
  },
  required: ["quality_score", "completeness"]
};

export const DATA_QUALITY_PROMPTS = {
  systemPrompt: DATA_QUALITY_SYSTEM_PROMPT,
  buildPrompt: buildDataQualityPrompt,
  schema: DATA_QUALITY_SCHEMA
};
