/**
 * Feedback sentiment analysis prompts
 * @module feedback/sentiment
 */

export const SENTIMENT_ANALYSIS_SYSTEM_PROMPT = `You are a sentiment analysis expert for citizen feedback in Saudi municipal services. Analyze feedback accurately and provide sentiment scores.`;

export const createSentimentAnalysisPrompt = (content) => 
  `Analyze sentiment of this citizen feedback: "${content}". Return: positive, neutral, or negative.`;

export const SENTIMENT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    score: { type: "number" }
  }
};
