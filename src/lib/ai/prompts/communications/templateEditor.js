/**
 * Email Template Editor Prompts
 * @module communications/templateEditor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TEMPLATE_EDITOR_SYSTEM_PROMPT = getSystemPrompt('template_editor', `
You are an email template specialist for Saudi government communications.
Your role is to generate professional, bilingual email templates for municipal innovation programs.
Follow Saudi government communication standards and formal Arabic conventions.
`);

/**
 * Build template generation prompt
 * @param {Object} params - Template context data
 * @returns {string} Formatted prompt
 */
export function buildTemplateEditorPrompt({ templateType, context, audience, tone }) {
  return `Generate an email template for:

TYPE: ${templateType || 'general'}
AUDIENCE: ${audience || 'stakeholders'}
TONE: ${tone || 'professional'}
CONTEXT: ${JSON.stringify(context || {})}

Generate:
1. Subject line (English and Arabic)
2. Email body (English and Arabic)
3. Call-to-action text
4. Personalization placeholders (e.g., {{recipient_name}})
5. Suggested send timing

Follow Saudi government communication standards.`;
}

export const TEMPLATE_EDITOR_SCHEMA = {
  type: "object",
  properties: {
    subject_en: { type: "string" },
    subject_ar: { type: "string" },
    body_en: { type: "string" },
    body_ar: { type: "string" },
    cta_text_en: { type: "string" },
    cta_text_ar: { type: "string" },
    placeholders: { type: "array", items: { type: "string" } },
    send_timing: { type: "string" }
  },
  required: ["subject_en", "subject_ar", "body_en", "body_ar"]
};

export const TEMPLATE_EDITOR_PROMPTS = {
  systemPrompt: TEMPLATE_EDITOR_SYSTEM_PROMPT,
  buildPrompt: buildTemplateEditorPrompt,
  schema: TEMPLATE_EDITOR_SCHEMA
};
