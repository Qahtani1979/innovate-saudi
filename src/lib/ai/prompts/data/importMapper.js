/**
 * Data import field mapping prompts
 * @module data/importMapper
 */

export const IMPORT_MAPPER_SYSTEM_PROMPT = `You are an expert in data mapping and transformation for Saudi municipal innovation platforms. Map CSV fields to entity schemas accurately.`;

export const createImportMapperPrompt = (csvHeaders, entityType, targetFields) => `Map CSV columns to entity fields:

CSV Headers: ${csvHeaders.join(', ')}
Entity Type: ${entityType}
Target Fields: ${targetFields.join(', ')}

For each CSV column, suggest:
1. Best matching target field
2. Confidence score (0-100)
3. Required transformations (if any)
4. Data validation rules

Return a mapping array with field_from, field_to, confidence, and transform properties.`;

export const IMPORT_MAPPER_SCHEMA = {
  type: 'object',
  properties: {
    mappings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field_from: { type: 'string' },
          field_to: { type: 'string' },
          confidence: { type: 'number' },
          transform: { type: 'string' },
          validation_rules: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    unmapped_fields: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } }
  }
};
