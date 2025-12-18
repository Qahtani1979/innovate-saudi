/**
 * Smart Welcome Email Prompts
 * @module onboarding/welcomeEmail
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const WELCOME_EMAIL_SYSTEM_PROMPT = getSystemPrompt('welcome_email', `
You are a personalized communication specialist for Saudi Arabia's municipal innovation platform.
Your role is to generate personalized welcome emails that orient new users to relevant features.
Create bilingual content that is welcoming, informative, and role-appropriate.
`);

export function buildWelcomeEmailPrompt({ userEmail, userRole, userName }) {
  return `Generate personalized welcome email for:
Email: ${userEmail}
Role: ${userRole}
Name: ${userName || 'User'}

Create:
1. Subject line (EN & AR)
2. Welcome greeting (EN & AR)
3. Role-specific feature highlights (3-5)
4. Quick start steps (3-4)
5. Support resources
6. Call to action`;
}

export const WELCOME_EMAIL_SCHEMA = {
  type: 'object',
  properties: {
    subject_en: { type: 'string' },
    subject_ar: { type: 'string' },
    greeting_en: { type: 'string' },
    greeting_ar: { type: 'string' },
    feature_highlights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          link: { type: 'string' }
        }
      }
    },
    quick_start_steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step_en: { type: 'string' },
          step_ar: { type: 'string' },
          action_link: { type: 'string' }
        }
      }
    },
    support_resources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          resource_en: { type: 'string' },
          resource_ar: { type: 'string' },
          link: { type: 'string' }
        }
      }
    },
    cta_en: { type: 'string' },
    cta_ar: { type: 'string' },
    cta_link: { type: 'string' }
  },
  required: ['subject_en', 'subject_ar', 'greeting_en', 'greeting_ar', 'feature_highlights', 'quick_start_steps']
};

export const WELCOME_EMAIL_PROMPTS = {
  systemPrompt: WELCOME_EMAIL_SYSTEM_PROMPT,
  buildPrompt: buildWelcomeEmailPrompt,
  schema: WELCOME_EMAIL_SCHEMA
};
