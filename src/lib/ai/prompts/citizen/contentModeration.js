/**
 * Content Moderation AI Prompts
 * Moderates citizen-submitted content for appropriateness
 * @module citizen/contentModeration
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate content moderation prompt
 */
export function generateContentModerationPrompt(text) {
  return `Analyze this citizen-submitted text for content moderation:

Text: "${text}"

Detect:
1. Toxicity (profanity, hate speech, threats) - score 0-100
2. Spam likelihood - score 0-100
3. Is appropriate for public platform - boolean
4. Issues found (array of specific concerns)
5. Contains personal information that should be redacted - boolean
6. Language appropriateness for government platform - boolean

Return comprehensive moderation assessment.`;
}

/**
 * Get content moderation schema
 */
export function getContentModerationSchema() {
  return {
    type: "object",
    properties: {
      toxicity_score: { type: "number" },
      spam_score: { type: "number" },
      is_appropriate: { type: "boolean" },
      issues: { type: "array", items: { type: "string" } },
      contains_pii: { type: "boolean" },
      language_appropriate: { type: "boolean" },
      moderation_action: {
        type: "string",
        enum: ['approve', 'flag_review', 'auto_reject', 'redact_and_approve']
      },
      confidence: { type: "number" }
    }
  };
}

/**
 * Get system prompt for content moderation
 */
export function getContentModerationSystemPrompt() {
  return getSystemPrompt('content-moderator');
}

export const CONTENT_MODERATION_CONFIG = {
  name: 'content-moderation',
  version: '1.0.0',
  description: 'AI-powered content moderation for citizen submissions'
};
