/**
 * Auto-translation prompts
 * @module translation/autoTranslation
 */

export const AUTO_TRANSLATION_SYSTEM_PROMPT = `You are a professional translator specializing in English-Arabic translation for Saudi government and municipal contexts. Maintain formal tone and accuracy.`;

export const createAutoTranslationPrompt = (text, targetLang) => 
  `Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Maintain tone and meaning:\n\n${text}`;

export const AUTO_TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    translated_text: { type: 'string' }
  }
};

export const createFieldTranslationPrompt = (sourceText, sourceLang, targetLang) => 
  `Translate the following text from ${sourceLang === 'en' ? 'English' : 'Arabic'} to ${targetLang === 'en' ? 'English' : 'Arabic'}. 
Keep it professional and formal. Only return the translated text, nothing else.

Text to translate: ${sourceText}`;

export const FIELD_TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    translation: { type: 'string' }
  }
};
