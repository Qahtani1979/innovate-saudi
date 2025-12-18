/**
 * Message composer prompts for communications
 * @module communications/aiComposer
 */

export const AI_COMPOSER_SYSTEM_PROMPT = `You are a professional communications expert for Saudi municipal services. Compose clear, culturally appropriate messages in both English and Arabic.`;

export const createMessageComposePrompt = (intent, tone, language) => `Compose a ${tone} ${language === 'ar' ? 'Arabic' : 'English'} message:

Intent: ${intent}
Tone: ${tone}
Language: ${language === 'ar' ? 'Arabic' : 'English'}

Requirements:
- Professional and clear
- Culturally appropriate for Saudi context
- Actionable where relevant
- Appropriate greeting and closing`;

export const MESSAGE_COMPOSE_SCHEMA = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    subject: { type: 'string' },
    call_to_action: { type: 'string' }
  }
};

export const createMessageTranslatePrompt = (message, targetLang) => `Translate this message to ${targetLang === 'ar' ? 'Arabic' : 'English'}:

${message}

Requirements:
- Maintain professional tone
- Preserve meaning and intent
- Culturally appropriate for Saudi context`;

export const MESSAGE_TRANSLATE_SCHEMA = {
  type: 'object',
  properties: {
    translated_message: { type: 'string' }
  }
};

export const createCrisisMessagePrompt = (situation, audience) => `Generate a crisis communication message:

Situation: ${situation}
Target Audience: ${audience}

Provide in BOTH English AND Arabic:
1. Immediate response message
2. Key facts to communicate
3. Recommended actions
4. Follow-up messaging plan`;

export const CRISIS_MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    immediate_response_en: { type: 'string' },
    immediate_response_ar: { type: 'string' },
    key_facts: { type: 'array', items: { type: 'string' } },
    recommended_actions_en: { type: 'array', items: { type: 'string' } },
    recommended_actions_ar: { type: 'array', items: { type: 'string' } },
    followup_plan: { type: 'string' }
  }
};
