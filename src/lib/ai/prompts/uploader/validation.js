/**
 * AI Uploader Validation Prompts
 * @module uploader/validation
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// Translation prompts
export const TRANSLATION_SYSTEM_PROMPT = 'You are an expert Arabic translator specializing in government and municipal terminology. Provide accurate, formal Arabic translations.';

export const buildTranslationPrompt = (textsToTranslate) => `Translate the following English texts to Arabic. Maintain formal tone suitable for government/municipal context.

${JSON.stringify(textsToTranslate, null, 2)}

Return translations in the exact format specified.`;

export const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    translations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rowIndex: { type: 'number' },
          field: { type: 'string' },
          arabic: { type: 'string' }
        }
      }
    }
  }
};

// Data Quality prompts
export const DATA_QUALITY_SYSTEM_PROMPT = 'You are a data quality expert. Analyze data for issues and suggest improvements.';

export const buildDataQualityPrompt = (entityType, sampleRows, availableRefs, fields) => `Analyze this data for quality issues and suggest improvements.

Entity type: ${entityType}
Sample data: ${JSON.stringify(sampleRows, null, 2)}

Available reference entities for linking:
${availableRefs}

Fields in data: ${fields}

Look for:
1. Typos or inconsistencies
2. Invalid formats (dates, numbers)
3. Missing links that could be inferred from context
4. Standardization opportunities

Return corrections and enrichments.`;

export const DATA_QUALITY_SCHEMA = {
  type: 'object',
  properties: {
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rowIndex: { type: 'number' },
          field: { type: 'string' },
          originalValue: { type: 'string' },
          suggestedValue: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    },
    enrichments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rowIndex: { type: 'number' },
          field: { type: 'string' },
          suggestedValue: { type: 'string' },
          confidence: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    }
  }
};

export const VALIDATION_PROMPTS = {
  translation: {
    systemPrompt: TRANSLATION_SYSTEM_PROMPT,
    buildPrompt: buildTranslationPrompt,
    schema: TRANSLATION_SCHEMA
  },
  dataQuality: {
    systemPrompt: DATA_QUALITY_SYSTEM_PROMPT,
    buildPrompt: buildDataQualityPrompt,
    schema: DATA_QUALITY_SCHEMA
  }
};

export default VALIDATION_PROMPTS;
