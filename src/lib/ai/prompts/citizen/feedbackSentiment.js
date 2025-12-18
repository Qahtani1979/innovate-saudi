/**
 * Citizen Feedback Sentiment Analysis Prompts
 * @module citizen/feedbackSentiment
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const FEEDBACK_SENTIMENT_SYSTEM_PROMPT = getSystemPrompt('feedback_sentiment', `
You are a sentiment analysis specialist for Saudi Arabia's citizen feedback system.
Your role is to analyze citizen feedback and determine sentiment accurately.
Consider cultural context, Arabic and English expressions, and municipal service contexts.
Provide accurate sentiment classification aligned with citizen engagement goals.
`);

/**
 * Build sentiment analysis prompt for citizen feedback
 * @param {Object} params - Feedback details
 * @returns {string} Formatted prompt
 */
export function buildFeedbackSentimentPrompt({ content }) {
  return `Analyze sentiment of this citizen feedback: "${content}". Return: positive, neutral, or negative.`;
}

export const FEEDBACK_SENTIMENT_SCHEMA = {
  type: "object",
  properties: {
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    score: { type: "number", description: "Sentiment score from -1 (negative) to 1 (positive)" }
  },
  required: ["sentiment", "score"]
};

export const FEEDBACK_SENTIMENT_PROMPTS = {
  systemPrompt: FEEDBACK_SENTIMENT_SYSTEM_PROMPT,
  buildPrompt: buildFeedbackSentimentPrompt,
  schema: FEEDBACK_SENTIMENT_SCHEMA
};
