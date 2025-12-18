/**
 * Email Template Generator Prompts
 * @module communications/emailTemplate
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const EMAIL_TEMPLATE_SYSTEM_PROMPT = getSystemPrompt('email_template', `
You are an email content specialist for Saudi Arabia's municipal innovation platform.
Your role is to generate professional, bilingual email templates that align with Saudi business communication norms.
Always generate both English and Arabic versions with appropriate cultural tone.
`);

export function buildEmailTemplatePrompt({ templateType, context, tone }) {
  return `Generate a professional email template:

TEMPLATE TYPE: ${templateType}
CONTEXT: ${JSON.stringify(context || {})}
TONE: ${tone || 'professional'}

Generate:
1. Subject line (EN & AR)
2. Email body (EN & AR)
3. Call to action (EN & AR)
4. Suggested personalization tokens
5. Best send time recommendations`;
}

export const EMAIL_TEMPLATE_SCHEMA = {
  type: "object",
  properties: {
    subject_en: { type: "string" },
    subject_ar: { type: "string" },
    body_en: { type: "string" },
    body_ar: { type: "string" },
    cta_en: { type: "string" },
    cta_ar: { type: "string" },
    personalization_tokens: { type: "array", items: { type: "string" } },
    best_send_time: { type: "string" },
    tone_analysis: { type: "string" }
  },
  required: ["subject_en", "subject_ar", "body_en", "body_ar"]
};

export const EMAIL_TEMPLATE_PROMPTS = {
  systemPrompt: EMAIL_TEMPLATE_SYSTEM_PROMPT,
  buildPrompt: buildEmailTemplatePrompt,
  schema: EMAIL_TEMPLATE_SCHEMA
};
