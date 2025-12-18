/**
 * Miscellaneous Page Prompts
 * Prompts for remaining utility pages
 * @module pages/misc
 */

export const HELP_CENTER_SYSTEM_PROMPT = `You are a help center assistant for the BALADI platform.
Provide clear, step-by-step guidance for platform features and troubleshooting.`;

export const HELP_CENTER_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    related_topics: { type: "array", items: { type: "string" } },
    steps: { type: "array", items: { type: "string" } },
    resources: { type: "array", items: { type: "string" } }
  },
  required: ["answer"]
};

export const buildHelpCenterPrompt = (query, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';
  return `${langInstruction}\n\nUser query: ${query}\n\nProvide helpful guidance.`;
};

export const SETTINGS_ASSISTANT_SYSTEM_PROMPT = `You are a settings configuration assistant for government platform administrators.
Help users configure platform settings optimally for their organization.`;

export const SETTINGS_ASSISTANT_SCHEMA = {
  type: "object",
  properties: {
    recommendation: { type: "string" },
    settings: { type: "array", items: { type: "object" } },
    warnings: { type: "array", items: { type: "string" } }
  },
  required: ["recommendation"]
};

export const buildSettingsAssistantPrompt = (settingsContext, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';
  return `${langInstruction}\n\nSettings context: ${JSON.stringify(settingsContext)}\n\nProvide configuration recommendations.`;
};

export const MISC_PAGE_PROMPTS = {
  helpCenter: {
    system: HELP_CENTER_SYSTEM_PROMPT,
    schema: HELP_CENTER_SCHEMA,
    buildPrompt: buildHelpCenterPrompt
  },
  settingsAssistant: {
    system: SETTINGS_ASSISTANT_SYSTEM_PROMPT,
    schema: SETTINGS_ASSISTANT_SCHEMA,
    buildPrompt: buildSettingsAssistantPrompt
  }
};

export default MISC_PAGE_PROMPTS;
