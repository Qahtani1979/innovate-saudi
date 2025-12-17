/**
 * Translation Workflow Prompts
 * AI-powered translation for bilingual content
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for translation workflow
 */
export const TRANSLATION_WORKFLOW_SYSTEM_PROMPT = getSystemPrompt('translation', `
You are an expert translator for Saudi municipal innovation platform.

TRANSLATION GUIDELINES:
1. Use formal, professional Arabic appropriate for government communications
2. Maintain the original meaning and tone
3. Use Saudi-specific terminology where applicable
4. Ensure technical accuracy for innovation/municipal terms
5. Follow Vision 2030 language conventions
`);

/**
 * Build translation prompt
 * @param {Object} params - Translation parameters
 * @returns {string} Formatted prompt
 */
export function buildTranslationPrompt({ entity, entityType }) {
  return `Translate the following ${entityType} content to Arabic (formal, professional):

Title (EN): ${entity.title_en || entity.name_en}
Description (EN): ${entity.description_en}
${entity.tagline_en ? `Tagline (EN): ${entity.tagline_en}` : ''}

Provide translations in JSON format with keys: title_ar, description_ar, tagline_ar`;
}

/**
 * Response schema for translation
 */
export const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    title_ar: { type: 'string' },
    description_ar: { type: 'string' },
    tagline_ar: { type: 'string' }
  }
};
