/**
 * AI Idea Classifier Prompts
 * Classifies citizen ideas by sector, quality, and priority
 * @module citizen/ideaClassifier
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate idea classification prompt
 */
export function generateIdeaClassificationPrompt(idea) {
  return `Classify citizen idea and detect issues:

IDEA: ${idea?.content || idea?.title || 'No content provided'}
LOCATION: ${idea?.location || 'Not specified'}
SUBMITTED BY: ${idea?.user_email ? 'Registered user' : 'Anonymous'}

Provide:
1. Primary sector (urban_design, transport, environment, digital_services, public_safety, health, education, etc.)
2. Keywords (5-10 relevant terms)
3. Is it spam/low-quality? (true/false)
4. Sentiment (positive_suggestion, neutral, complaint)
5. Similar existing challenges (if any patterns detected)
6. Recommended priority (high/medium/low)
7. Quality score (0-100)`;
}

/**
 * Get idea classification schema
 */
export function getIdeaClassificationSchema() {
  return {
    type: "object",
    properties: {
      sector: { type: "string" },
      keywords: { type: "array", items: { type: "string" } },
      is_spam: { type: "boolean" },
      sentiment: { 
        type: "string",
        enum: ['positive_suggestion', 'neutral', 'complaint', 'question', 'appreciation']
      },
      similar_patterns: { type: "array", items: { type: "string" } },
      priority: { 
        type: "string",
        enum: ['high', 'medium', 'low']
      },
      quality_score: { type: "number" },
      suggested_tags: { type: "array", items: { type: "string" } },
      actionability: {
        type: "string",
        enum: ['immediately_actionable', 'requires_study', 'long_term', 'informational']
      }
    }
  };
}

/**
 * Get system prompt for idea classification
 */
export function getIdeaClassificationSystemPrompt() {
  return getSystemPrompt('citizen-idea-analyst');
}

export const IDEA_CLASSIFIER_CONFIG = {
  name: 'idea-classifier',
  version: '1.0.0',
  description: 'AI-powered citizen idea classification and quality assessment'
};
