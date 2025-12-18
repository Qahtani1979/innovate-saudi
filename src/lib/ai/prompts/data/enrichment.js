/**
 * Data Enrichment Prompts
 * @module data/enrichment
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DATA_ENRICHMENT_SYSTEM_PROMPT = getSystemPrompt('data_enrichment', `
You are a data enrichment specialist for Saudi Arabia's municipal innovation platform.
Your role is to add missing translations, tags, classifications, and metadata to entities.
Ensure bilingual content quality aligned with Vision 2030 objectives.
`);

/**
 * Build data enrichment prompt
 * @param {Object} params - Entity and type
 * @returns {string} Formatted prompt
 */
export function buildDataEnrichmentPrompt({ entity, entityType }) {
  return `Enrich ${entityType} data with AI insights:

CURRENT DATA: ${JSON.stringify(entity).substring(0, 800)}

Provide enrichments:
1. Missing translations (if title_en exists but not title_ar, suggest Arabic)
2. Suggested tags/keywords (5-10 relevant terms)
3. Sector classification (if ambiguous)
4. Related entities (suggest connections to other challenges/pilots/solutions)
5. Recommended KPIs (if not defined)
6. Estimated complexity/priority (if missing)`;
}

export const DATA_ENRICHMENT_SCHEMA = {
  type: 'object',
  properties: {
    translations: {
      type: 'object',
      properties: {
        title_ar: { type: 'string' },
        description_ar: { type: 'string' }
      }
    },
    tags: { type: 'array', items: { type: 'string' } },
    sector: { type: 'string' },
    related_codes: { type: 'array', items: { type: 'string' } },
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          baseline: { type: 'string' },
          target: { type: 'string' }
        }
      }
    },
    priority: { type: 'string' }
  }
};

export const DATA_ENRICHMENT_PROMPTS = {
  systemPrompt: DATA_ENRICHMENT_SYSTEM_PROMPT,
  buildPrompt: buildDataEnrichmentPrompt,
  schema: DATA_ENRICHMENT_SCHEMA
};
