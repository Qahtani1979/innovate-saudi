/**
 * Sentiment Monitor Prompts
 * @module communications/sentimentMonitor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SENTIMENT_MONITOR_SYSTEM_PROMPT = getSystemPrompt('sentiment_monitor', `
You are a sentiment analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze citizen and stakeholder sentiment across communications channels.
Consider cultural context and Arabic language nuances in your analysis.
`);

export function buildSentimentMonitorPrompt({ messages, timeRange, channels }) {
  return `Analyze sentiment across communications:

TIME RANGE: ${timeRange || 'Last 7 days'}
CHANNELS: ${channels?.join(', ') || 'All channels'}

MESSAGES TO ANALYZE (${messages?.length || 0}):
${messages?.slice(0, 20).map((m, i) => `${i+1}. [${m.channel}] ${m.content?.substring(0, 100)}`).join('\n') || 'No messages provided'}

Provide:
1. Overall sentiment score (-1 to 1)
2. Sentiment breakdown by channel
3. Key themes and topics
4. Emerging concerns
5. Positive highlights
6. Recommended actions`;
}

export const SENTIMENT_MONITOR_SCHEMA = {
  type: "object",
  properties: {
    overall_sentiment: { type: "number", minimum: -1, maximum: 1 },
    sentiment_label: { type: "string", enum: ["very_negative", "negative", "neutral", "positive", "very_positive"] },
    channel_breakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          channel: { type: "string" },
          sentiment: { type: "number" },
          message_count: { type: "number" }
        }
      }
    },
    key_themes: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
    highlights: { type: "array", items: { type: "string" } },
    recommended_actions: { type: "array", items: { type: "string" } }
  },
  required: ["overall_sentiment", "sentiment_label", "key_themes"]
};

export const SENTIMENT_MONITOR_PROMPTS = {
  systemPrompt: SENTIMENT_MONITOR_SYSTEM_PROMPT,
  buildPrompt: buildSentimentMonitorPrompt,
  schema: SENTIMENT_MONITOR_SCHEMA
};
