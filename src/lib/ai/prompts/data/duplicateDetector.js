/**
 * Duplicate Record Detector Prompts
 * @module data/duplicateDetector
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DUPLICATE_DETECTOR_SYSTEM_PROMPT = getSystemPrompt('duplicate_detector', `
You are a data quality specialist for Saudi Arabia's municipal innovation platform.
Your role is to detect duplicate and similar records for data cleanup.
Identify exact matches, near-duplicates, and recommend appropriate actions.
Consider bilingual content and code variations when detecting duplicates.
`);

/**
 * Build duplicate detection prompt
 * @param {Object} params - Entity records details
 * @returns {string} Formatted prompt
 */
export function buildDuplicateDetectorPrompt({ entities }) {
  const recordList = entities.slice(0, 50).map(e => 
    `ID: ${e.id}, Title: ${e.title_en || e.name_en || e.title}, Code: ${e.code || 'N/A'}`
  ).join('\n');

  return `Detect duplicate or highly similar records:

RECORDS: ${recordList}

Identify:
1. Exact duplicates (100% match)
2. Near duplicates (>85% similar)
3. Reason for similarity
4. Recommendation (merge, keep both, delete)`;
}

export const DUPLICATE_DETECTOR_SCHEMA = {
  type: "object",
  properties: {
    duplicate_groups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          record_ids: { type: "array", items: { type: "string" } },
          similarity: { type: "number", minimum: 0, maximum: 100 },
          reason: { type: "string" },
          recommendation: { type: "string", enum: ["merge", "keep_both", "delete_one"] }
        },
        required: ["record_ids", "similarity", "reason", "recommendation"]
      }
    }
  },
  required: ["duplicate_groups"]
};

export const DUPLICATE_DETECTOR_PROMPTS = {
  systemPrompt: DUPLICATE_DETECTOR_SYSTEM_PROMPT,
  buildPrompt: buildDuplicateDetectorPrompt,
  schema: DUPLICATE_DETECTOR_SCHEMA
};
