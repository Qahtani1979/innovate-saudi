/**
 * AI Uploader Field Mapping Prompts
 * @module uploader/fieldMapping
 */

export const FIELD_MAPPING_SYSTEM_PROMPT = 'You are a data mapping expert. Analyze column headers and sample data to create accurate field mappings.';

export const buildFieldMappingPrompt = (sourceColumns, entityType, entityFields, sampleData) => `Analyze these source columns and suggest field mappings:

Source columns: ${sourceColumns.join(', ')}

Target fields for "${entityType}":
${entityFields.map(f => `- ${f.name}: ${f.label} (${f.required ? 'required' : 'optional'}, type: ${f.type})`).join('\n')}

Sample data:
${JSON.stringify(sampleData, null, 2)}

Return mappings as key-value pairs where key is target field name and value is source column name.
Also include confidence score (0-1) for each mapping.`;

export const FIELD_MAPPING_SCHEMA = {
  type: 'object',
  properties: {
    mappings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          target_field: { type: 'string' },
          source_column: { type: 'string' },
          confidence: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    }
  }
};

export const FIELD_MAPPING_PROMPTS = {
  systemPrompt: FIELD_MAPPING_SYSTEM_PROMPT,
  buildPrompt: buildFieldMappingPrompt,
  schema: FIELD_MAPPING_SCHEMA
};

export default FIELD_MAPPING_PROMPTS;
