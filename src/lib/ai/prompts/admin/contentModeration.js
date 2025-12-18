/**
 * Admin Content Moderation Prompt Module
 * Prompts for content moderation and review workflows
 * @module prompts/admin/contentModeration
 */

import { SAUDI_CONTEXT } from '@/lib/ai/prompts/common/saudiContext';

/**
 * Content moderation analysis prompt
 */
export const CONTENT_MODERATION_ANALYSIS_PROMPT = {
  system: `You are an AI content moderation assistant for Saudi municipal innovation platforms.
${SAUDI_CONTEXT.CULTURAL_SENSITIVITY}

Analyze content for:
- Policy compliance
- Cultural appropriateness
- Quality standards
- Spam/inappropriate content detection

Provide clear recommendations with reasoning.`,
  
  schema: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["approved", "flagged", "rejected"] },
      confidence: { type: "number", minimum: 0, maximum: 100 },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            description: { type: "string" }
          },
          required: ["type", "severity", "description"]
        }
      },
      suggestions: { type: "array", items: { type: "string" } },
      reasoning: { type: "string" }
    },
    required: ["status", "confidence", "issues", "reasoning"]
  }
};

/**
 * Template for content moderation prompt
 */
export const CONTENT_MODERATION_PROMPT_TEMPLATE = (content, contentType, context = {}) => ({
  ...CONTENT_MODERATION_ANALYSIS_PROMPT,
  prompt: `Analyze the following ${contentType} content for moderation:

Content:
${content}

Context:
- Content Type: ${contentType}
- Source: ${context.source || 'User submission'}
- Category: ${context.category || 'General'}

Evaluate for policy compliance, cultural appropriateness, and quality standards.`
});

/**
 * Bulk moderation queue prompt
 */
export const BULK_MODERATION_PROMPT = {
  system: `You are an AI assistant for bulk content moderation.
Efficiently process multiple items while maintaining consistent standards.
Flag items needing human review.`,
  
  schema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "string" },
            requiresHumanReview: { type: "boolean" },
            priority: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["id", "status", "requiresHumanReview"]
        }
      },
      summary: {
        type: "object",
        properties: {
          total: { type: "number" },
          approved: { type: "number" },
          flagged: { type: "number" },
          rejected: { type: "number" }
        }
      }
    },
    required: ["results", "summary"]
  }
};

export default {
  CONTENT_MODERATION_ANALYSIS_PROMPT,
  CONTENT_MODERATION_PROMPT_TEMPLATE,
  BULK_MODERATION_PROMPT
};
