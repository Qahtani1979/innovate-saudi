/**
 * Data Migration Validator Prompts
 * @module data/migrationValidator
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MIGRATION_VALIDATOR_SYSTEM_PROMPT = getSystemPrompt('migration_validator', `
You are a data migration specialist for Saudi municipal systems.
Your role is to validate data transformations and identify potential issues.
Focus on data integrity, format consistency, and completeness.
`);

/**
 * Build migration validation prompt
 * @param {Object} params - Source and target data
 * @returns {string} Formatted prompt
 */
export function buildMigrationValidatorPrompt({ sourceSchema, targetSchema, sampleRecords, mappingRules }) {
  return `Validate data migration:

Source Schema:
${JSON.stringify(sourceSchema || {}, null, 2)}

Target Schema:
${JSON.stringify(targetSchema || {}, null, 2)}

Mapping Rules:
${mappingRules?.map(r => `${r.source} → ${r.target}`).join('\n') || 'Not defined'}

Sample Records:
${JSON.stringify(sampleRecords?.slice(0, 3) || [], null, 2)}

Validate:
1. Field mapping completeness
2. Data type compatibility
3. Required field coverage
4. Potential data loss
5. Transformation accuracy
6. Recommendations for safe migration`;
}

export const MIGRATION_VALIDATOR_SCHEMA = {
  type: "object",
  properties: {
    is_valid: { type: "boolean" },
    completeness_score: { type: "number" },
    unmapped_fields: { type: "array", items: { type: "string" } },
    type_mismatches: { type: "array", items: { type: "string" } },
    data_loss_risks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  }
};

export const MIGRATION_VALIDATOR_PROMPTS = {
  systemPrompt: MIGRATION_VALIDATOR_SYSTEM_PROMPT,
  buildPrompt: buildMigrationValidatorPrompt,
  schema: MIGRATION_VALIDATOR_SCHEMA
};
