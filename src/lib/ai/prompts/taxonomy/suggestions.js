/**
 * Taxonomy Suggestions Prompts
 * AI-powered taxonomy analysis and suggestions
 * @module prompts/taxonomy/suggestions
 */

/**
 * Taxonomy suggestions prompt template
 * @param {Object} data - Taxonomy data
 * @returns {string} Formatted prompt
 */
export const TAXONOMY_SUGGESTIONS_PROMPT_TEMPLATE = (data) => `
Analyze current taxonomy and suggest improvements for Saudi municipal innovation:

Current Sectors: ${data.sectors?.map(s => s.name_en).join(', ') || 'None'}
Total Subsectors: ${data.subsectorsCount || 0}
Total Services: ${data.servicesCount || 0}

Provide bilingual suggestions for:
1. Missing critical sectors
2. Subsectors that should be added to existing sectors
3. Service gaps and missing service types

Focus on Vision 2030, smart cities, and municipal service excellence.
`;

/**
 * Response schema for taxonomy suggestions
 */
export const TAXONOMY_SUGGESTIONS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    suggested_sectors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          code: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          rationale_en: { type: 'string' },
          rationale_ar: { type: 'string' }
        }
      }
    }
  }
};

/**
 * System prompt for taxonomy suggestions
 */
export const TAXONOMY_SUGGESTIONS_SYSTEM_PROMPT = `You are an expert in municipal taxonomy and classification systems, with deep knowledge of Saudi Arabia's Vision 2030 and smart city initiatives. Provide strategic taxonomy recommendations.`;

export default {
  TAXONOMY_SUGGESTIONS_PROMPT_TEMPLATE,
  TAXONOMY_SUGGESTIONS_RESPONSE_SCHEMA,
  TAXONOMY_SUGGESTIONS_SYSTEM_PROMPT
};
