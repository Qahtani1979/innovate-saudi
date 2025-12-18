/**
 * Extraction Prompts - Data parsing and extraction
 * @module prompts/extraction
 */

export const extractionPrompts = {
  dataExtractor: {
    id: 'extraction_data',
    name: 'Data Extractor',
    description: 'Extract structured data from unstructured text',
    prompt: (context) => `
Extract structured data from the following content.

CONTENT:
${context.content}

TARGET SCHEMA:
${JSON.stringify(context.schema, null, 2)}

EXTRACTION RULES:
- Extract only data matching the schema
- Preserve original values where possible
- Flag uncertain extractions
- Handle missing fields gracefully

Return extracted data matching the schema.
`,
    schema: {
      extracted_data: 'object',
      confidence_scores: 'object',
      missing_fields: 'array',
      extraction_notes: 'array'
    }
  },

  documentParser: {
    id: 'extraction_document',
    name: 'Document Parser',
    description: 'Parse documents into structured sections',
    prompt: (context) => `
Parse this document into structured sections.

DOCUMENT:
${context.document}

DOCUMENT TYPE: ${context.documentType || 'general'}

Parse into:
1. Metadata (title, date, author, etc.)
2. Main sections with headings
3. Key entities mentioned
4. Action items or decisions
5. References or citations

Return structured document representation.
`,
    schema: {
      metadata: 'object',
      sections: 'array',
      entities: 'array',
      action_items: 'array',
      references: 'array'
    }
  },

  entityExtractor: {
    id: 'extraction_entities',
    name: 'Entity Extractor',
    description: 'Extract named entities from text',
    prompt: (context) => `
Extract named entities from this text.

TEXT:
${context.text}

ENTITY TYPES TO EXTRACT:
${context.entityTypes?.join(', ') || 'people, organizations, locations, dates, amounts'}

For each entity provide:
- Entity text
- Entity type
- Context snippet
- Confidence level

Return all identified entities.
`,
    schema: {
      entities: 'array',
      entity_relationships: 'array',
      extraction_summary: 'object'
    }
  }
};

export const getExtractionPrompt = (type, context) => {
  const prompt = extractionPrompts[type];
  if (!prompt) throw new Error(`Unknown extraction prompt: ${type}`);
  return {
    prompt: prompt.prompt(context),
    schema: prompt.schema
  };
};
