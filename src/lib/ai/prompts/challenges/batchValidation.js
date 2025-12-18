/**
 * Batch Validation Prompts for Challenge Import
 * @module challenges/batchValidation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const BATCH_VALIDATION_SYSTEM_PROMPT = getSystemPrompt('batch_validation', `
You are a data quality specialist for Saudi Arabia's municipal innovation platform.
Your role is to validate imported challenge data for duplicates, missing fields, and quality issues.
Apply semantic analysis to detect similar challenges and ensure data integrity.
`);

export function buildBatchValidationPrompt({ challenges }) {
  return `Validate these ${challenges.length} challenges for import:

${challenges.map((c, i) => `${i+1}. ${c.title_en || c.title_ar}`).join('\n')}

Check for:
1. Duplicates (semantic similarity >85%)
2. Missing required fields
3. Data quality issues
4. Suggested improvements

Return validation results.`;
}

export const BATCH_VALIDATION_SCHEMA = {
  type: "object",
  properties: {
    duplicates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_index: { type: "number" },
          similar_to_index: { type: "number" },
          similarity: { type: "number" }
        }
      }
    },
    missing_fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_index: { type: "number" },
          fields: { type: "array", items: { type: "string" } }
        }
      }
    },
    quality_issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_index: { type: "number" },
          issue: { type: "string" }
        }
      }
    }
  },
  required: ["duplicates", "missing_fields", "quality_issues"]
};

export const BATCH_VALIDATION_PROMPTS = {
  systemPrompt: BATCH_VALIDATION_SYSTEM_PROMPT,
  buildPrompt: buildBatchValidationPrompt,
  schema: BATCH_VALIDATION_SCHEMA
};
