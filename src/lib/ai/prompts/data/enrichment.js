/**
 * Data Enrichment Prompts
 * @module data/enrichment
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DATA_ENRICHMENT_SYSTEM_PROMPT = getSystemPrompt('data_enrichment', `
You are a data enrichment specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze entity data and suggest enrichments, corrections, and additional context.
Consider Saudi market context, industry standards, and Vision 2030 classifications.
`);

export function buildDataEnrichmentPrompt({ entityType, entity }) {
  return `Enrich ${entityType} data with AI insights:

CURRENT DATA: ${JSON.stringify(entity).substring(0, 800)}

Analyze and enrich:
1. Missing fields that should be populated
2. Data quality issues to correct
3. Additional metadata suggestions
4. Classification improvements
5. Related entity suggestions
6. Confidence score for suggestions`;
}

export const DATA_ENRICHMENT_SCHEMA = {
  type: 'object',
  properties: {
    suggested_fields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field_name: { type: 'string' },
          suggested_value: { type: 'string' },
          confidence: { type: 'number' },
          source: { type: 'string' }
        }
      }
    },
    quality_corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field_name: { type: 'string' },
          current_value: { type: 'string' },
          corrected_value: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    },
    additional_metadata: { type: 'object' },
    classification_suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          suggested_value: { type: 'string' },
          confidence: { type: 'number' }
        }
      }
    },
    related_entities: { type: 'array', items: { type: 'string' } },
    overall_quality_score: { type: 'number', minimum: 0, maximum: 100 }
  },
  required: ['suggested_fields', 'quality_corrections', 'overall_quality_score']
};

export const DATA_ENRICHMENT_PROMPTS = {
  systemPrompt: DATA_ENRICHMENT_SYSTEM_PROMPT,
  buildPrompt: buildDataEnrichmentPrompt,
  schema: DATA_ENRICHMENT_SCHEMA
};
