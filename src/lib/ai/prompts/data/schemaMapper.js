/**
 * Schema Mapper Prompts
 * @module data/schemaMapper
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SCHEMA_MAPPER_SYSTEM_PROMPT = getSystemPrompt('schema_mapper', `
You are a data schema specialist for Saudi municipal systems.
Your role is to intelligently map fields between different data schemas.
Use semantic understanding to match fields with different names but similar meanings.
`);

/**
 * Build schema mapping prompt
 * @param {Object} params - Source and target schemas
 * @returns {string} Formatted prompt
 */
export function buildSchemaMapperPrompt({ sourceFields, targetFields, context }) {
  return `Map fields between schemas:

Source Fields:
${sourceFields?.map(f => `- ${f.name}: ${f.type} ${f.description ? `(${f.description})` : ''}`).join('\n') || 'Not provided'}

Target Fields:
${targetFields?.map(f => `- ${f.name}: ${f.type} ${f.required ? '(required)' : ''}`).join('\n') || 'Not provided'}

Context: ${context || 'General data migration'}

Generate:
1. Field mappings with confidence scores
2. Transformation rules needed
3. Unmappable fields
4. Suggested default values for missing required fields`;
}

export const SCHEMA_MAPPER_SCHEMA = {
  type: "object",
  properties: {
    mappings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source_field: { type: "string" },
          target_field: { type: "string" },
          confidence: { type: "number" },
          transformation: { type: "string" }
        }
      }
    },
    unmapped_source: { type: "array", items: { type: "string" } },
    unmapped_target: { type: "array", items: { type: "string" } },
    default_values: { type: "object" }
  }
};

export const SCHEMA_MAPPER_PROMPTS = {
  systemPrompt: SCHEMA_MAPPER_SYSTEM_PROMPT,
  buildPrompt: buildSchemaMapperPrompt,
  schema: SCHEMA_MAPPER_SCHEMA
};
