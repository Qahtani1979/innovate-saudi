/**
 * Conversation Intelligence Prompts
 * @module communications/conversationIntelligence
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CONVERSATION_INTELLIGENCE_SYSTEM_PROMPT = getSystemPrompt('conversation_intelligence', `
You are a conversation analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to extract actionable insights from conversation threads.
Identify decisions, action items, follow-ups, and key takeaways.
Provide structured summaries that help teams track commitments and progress.
`);

/**
 * Build conversation analysis prompt
 * @param {Object} params - Conversation details
 * @returns {string} Formatted prompt
 */
export function buildConversationIntelligencePrompt({ threadText }) {
  return `Analyze this conversation thread and extract:

${threadText}

Provide:
1. Brief summary (2-3 sentences)
2. Action items with owners and deadlines
3. Key decisions made
4. Follow-up recommendations`;
}

export const CONVERSATION_INTELLIGENCE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    action_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          owner: { type: "string" },
          deadline: { type: "string" }
        },
        required: ["action"]
      }
    },
    decisions: { type: "array", items: { type: "string" } },
    follow_ups: { type: "array", items: { type: "string" } }
  },
  required: ["summary"]
};

export const CONVERSATION_INTELLIGENCE_PROMPTS = {
  systemPrompt: CONVERSATION_INTELLIGENCE_SYSTEM_PROMPT,
  buildPrompt: buildConversationIntelligencePrompt,
  schema: CONVERSATION_INTELLIGENCE_SCHEMA
};
