/**
 * Translation Prompts for Onboarding
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TRANSLATION_SYSTEM_PROMPT = getSystemPrompt('translation', `
You are a professional translator for Saudi municipal innovation platforms.
Provide accurate, formal translations while maintaining context.
`);

/**
 * Build translation prompt
 */
export function buildTranslationPrompt(sourceText, sourceLang) {
  const targetLang = sourceLang === 'en' ? 'Arabic' : 'English';
  const sourceLabel = sourceLang === 'en' ? 'English' : 'Arabic';
  
  return `Translate the following text from ${sourceLabel} to ${targetLang}. 
Keep it professional and formal. Only return the translated text, nothing else.

Text to translate: ${sourceText}`;
}

export const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    translation: { type: 'string', description: 'Translated text' }
  },
  required: ['translation']
};
