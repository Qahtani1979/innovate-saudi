import { useLanguage } from '../LanguageContext';

/**
 * Localize AI prompts based on content language
 */
export function useAIPromptLocalizer() {
  const { language } = useLanguage();

  const localizePrompt = (prompt, contentLanguage) => {
    const targetLang = contentLanguage || language;
    
    if (targetLang === 'ar') {
      return `${prompt}\n\nIMPORTANT: The content is in Arabic. Understand and respond appropriately to Arabic context. يجب فهم السياق العربي والرد بشكل مناسب.`;
    }
    
    return `${prompt}\n\nIMPORTANT: The content is in English. Understand and respond in English context.`;
  };

  return { localizePrompt };
}

export function getLocalizedPrompt(basePrompt, language, contextData) {
  const languageInstructions = {
    ar: '\n\nالسياق: المحتوى باللغة العربية. الرجاء الفهم والاستجابة وفقاً للسياق العربي.',
    en: '\n\nContext: Content is in English. Please understand and respond in English context.'
  };

  return `${basePrompt}${languageInstructions[language] || languageInstructions.en}${contextData ? `\n\nData: ${JSON.stringify(contextData)}` : ''}`;
}
