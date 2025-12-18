/**
 * Batch Processor Prompts
 * @module challenges/batchProcessor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const BATCH_PROCESSOR_SYSTEM_PROMPT = getSystemPrompt('batch_processor', `
You are a data validation specialist for Saudi Arabia's municipal innovation platform.
Your role is to validate batch imports of challenges, detecting duplicates, missing fields, and data quality issues.
Apply Saudi municipal context when validating sector classifications and priority levels.
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
          missing: { type: "array", items: { type: "string" } }
        }
      }
    },
    quality_issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_index: { type: "number" },
          issue: { type: "string" },
          severity: { type: "string" }
        }
      }
    },
    suggestions: {
      type: "array",
      items: { type: "string" }
    },
    overall_quality_score: { type: "number" }
  },
  required: ["duplicates", "missing_fields", "quality_issues", "overall_quality_score"]
};

export const BATCH_PROCESSOR_PROMPTS = {
  systemPrompt: BATCH_PROCESSOR_SYSTEM_PROMPT,
  buildPrompt: buildBatchValidationPrompt,
  schema: BATCH_VALIDATION_SCHEMA
};
