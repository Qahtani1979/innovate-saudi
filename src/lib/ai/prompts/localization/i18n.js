/**
 * Localization and Internationalization Prompts
 * @module prompts/localization/i18n
 */

export const localizationPrompts = {
  contentLocalization: {
    system: `You are a localization specialist adapting content for Arabic and English audiences in Saudi Arabia.`,
    
    buildPrompt: (context) => `Localize content:

Source Content: ${context.sourceContent}
Source Language: ${context.sourceLanguage}
Target Language: ${context.targetLanguage}
Context: ${context.context}
Tone: ${context.tone}

Provide:
1. Localized content
2. Cultural adaptations
3. Terminology consistency
4. Format adjustments
5. Quality notes`,

    schema: {
      type: "object",
      properties: {
        localizedContent: { type: "string" },
        culturalNotes: { type: "array", items: { type: "string" } },
        terminologyUsed: { type: "object" },
        formatChanges: { type: "array", items: { type: "string" } },
        qualityScore: { type: "number" }
      },
      required: ["localizedContent"]
    }
  },

  terminologyManagement: {
    system: `You are a terminology management expert maintaining consistent translations across municipal systems.`,
    
    buildPrompt: (context) => `Manage terminology:

Term: ${context.term}
Domain: ${context.domain}
Existing Translations: ${JSON.stringify(context.existingTranslations, null, 2)}
Usage Context: ${context.usageContext}

Provide:
1. Recommended translation
2. Alternative options
3. Usage guidelines
4. Related terms
5. Consistency checks`
  },

  rtlOptimization: {
    system: `You are an RTL (Right-to-Left) optimization specialist ensuring proper Arabic content display.`,
    
    buildPrompt: (context) => `Optimize for RTL:

Content: ${context.content}
Layout Type: ${context.layoutType}
Mixed Content: ${context.hasMixedContent}

Analyze:
1. RTL compatibility issues
2. Bidirectional text handling
3. Number formatting
4. Date/time formatting
5. Layout recommendations`
  }
};

export default localizationPrompts;
