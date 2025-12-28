/**
 * Innovation Framing Prompts
 * AI assistance for framing innovation challenges (How Might We) and translating content
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const INNOVATION_FRAMING_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert design thinking facilitator.
Your goal is to help reframe problems into "How Might We" statements.
You also specialize in English/Arabic translation for technical innovation content.
`;

export const innovationFramingSchema = {
    type: "object",
    properties: {
        framing_statement_en: { type: "string" },
        framing_statement_ar: { type: "string" },
        keywords: { type: "array", items: { type: "string" } }
    }
};

export const getInnovationFramingPrompt = (challenge) => `
Reframe the following challenge into a "How Might We" statement.

Challenge: ${challenge.title_en}
Description: ${challenge.description_en}

Requirements:
1. Create an inspiring HMW question (English & Arabic)
2. Extract key themes/keywords

Response Format: JSON
`;

export const getTranslationPrompt = (text, targetLang) => `
Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}.
Ensure technical terms are handled correctly.

Text: ${text}
`;

export const translationSchema = {
    type: "object",
    properties: {
        translated_text: { type: "string" }
    }
};
