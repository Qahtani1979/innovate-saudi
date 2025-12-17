/**
 * Communications AI prompts
 * For message composition and translation
 */

export const MESSAGE_COMPOSER_SYSTEM_PROMPT = `You are a professional communications specialist for government innovation.
Compose clear, professional messages adapted to the specified tone and audience.
Support both English and Arabic with culturally appropriate phrasing.
All responses must be in valid JSON format.`;

export function buildMessageComposerPrompt(intent, options = {}) {
  const { tone = 'professional', language = 'en', context = '' } = options;
  return `Compose ${tone} ${language === 'ar' ? 'Arabic' : 'English'} message:

INTENT: ${intent}
CONTEXT: ${context}
TONE: ${tone}

Generate a well-structured, professional message.`;
}

export const MESSAGE_COMPOSER_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    greeting: { type: "string" },
    body: { type: "string" },
    closing: { type: "string" },
    call_to_action: { type: "string" }
  },
  required: ["body"]
};

export const MESSAGE_TRANSLATOR_SYSTEM_PROMPT = `You are a professional translator for government communications.
Translate between English and Arabic while preserving tone and cultural nuance.
Maintain formal register appropriate for government contexts.`;

export function buildMessageTranslatorPrompt(text, targetLanguage) {
  return `Translate this message to ${targetLanguage === 'ar' ? 'Arabic' : 'English'}:

${text}

Preserve the professional tone and cultural appropriateness.`;
}

export const MESSAGE_TRANSLATOR_SCHEMA = {
  type: "object",
  properties: {
    translated_text: { type: "string" },
    notes: { type: "string" }
  },
  required: ["translated_text"]
};

export const CRISIS_RESPONSE_SYSTEM_PROMPT = `You are a crisis communications expert for government entities.
Draft clear, calm, and authoritative crisis response messages.
Balance transparency with appropriate discretion.`;

export function buildCrisisResponsePrompt(crisis, context) {
  return `Draft crisis response for:

SITUATION: ${crisis.description}
SEVERITY: ${crisis.severity || 'medium'}
AUDIENCE: ${crisis.audience || 'public'}
KEY FACTS: ${crisis.facts?.join(', ') || 'Under investigation'}

Generate a professional crisis response message.`;
}

export const CRISIS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    statement: { type: "string" },
    key_messages: { type: "array", items: { type: "string" } },
    qa_points: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" }
        }
      }
    },
    next_steps: { type: "array", items: { type: "string" } }
  },
  required: ["headline", "statement", "key_messages"]
};

export const MEDIA_BRIEF_SYSTEM_PROMPT = `You are a media relations specialist.
Generate concise, newsworthy media briefs and press materials.
Focus on key messages and quotable statements.`;

export function buildMediaBriefPrompt(entity, context) {
  return `Generate media brief for:

SUBJECT: ${entity.title_en || entity.name_en}
TYPE: ${entity.entity_type || 'initiative'}
KEY ACHIEVEMENTS: ${entity.achievements?.join(', ') || 'Various milestones'}
TARGET MEDIA: ${context.targetMedia || 'General press'}

Create a compelling media brief with key messages and quotes.`;
}

export const MEDIA_BRIEF_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    subheadline: { type: "string" },
    lead_paragraph: { type: "string" },
    key_messages: { type: "array", items: { type: "string" } },
    quotable_statements: { type: "array", items: { type: "string" } },
    background: { type: "string" },
    contact_info: { type: "string" }
  },
  required: ["headline", "lead_paragraph", "key_messages"]
};
