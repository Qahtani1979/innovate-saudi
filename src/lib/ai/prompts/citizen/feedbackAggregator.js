/**
 * Public Feedback Aggregator Prompts
 * Aggregates and analyzes public feedback for themes and sentiment
 * @module citizen/feedbackAggregator
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate feedback aggregation prompt
 */
export function generateFeedbackAggregationPrompt(feedback = [], context = {}) {
  const sampleFeedback = feedback.slice(0, 30).map(f => 
    `[${f.feedback_type || 'general'}] ${f.content?.substring(0, 100) || ''} - Sentiment: ${f.sentiment || 'N/A'}`
  ).join('\n');

  return `Aggregate and analyze public feedback:

TOTAL FEEDBACK: ${feedback.length}
MUNICIPALITY: ${context.municipalityName || 'All municipalities'}

Sample Feedback:
${sampleFeedback || 'No feedback samples available'}

Provide:
1. Top 5 recurring themes/issues
2. Sentiment breakdown (% positive/neutral/negative)
3. Geographic clusters (if location data available)
4. Priority recommendations (what to address first)
5. Trend analysis (increasing/decreasing concerns)
6. Actionable insights for municipal decision-makers`;
}

/**
 * Get feedback aggregation schema
 */
export function getFeedbackAggregationSchema() {
  return {
    type: "object",
    properties: {
      themes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            theme: { type: "string" },
            count: { type: "number" },
            priority: { type: "string" },
            description: { type: "string" }
          }
        }
      },
      sentiment_breakdown: {
        type: "object",
        properties: {
          positive: { type: "number" },
          neutral: { type: "number" },
          negative: { type: "number" }
        }
      },
      geographic_clusters: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
      trend: { type: "string" },
      actionable_insights: { type: "array", items: { type: "string" } },
      urgency_level: {
        type: "string",
        enum: ['critical', 'high', 'medium', 'low']
      },
      key_stakeholders: { type: "array", items: { type: "string" } }
    }
  };
}

/**
 * Get system prompt for feedback aggregation
 */
export function getFeedbackAggregationSystemPrompt() {
  return getSystemPrompt('public-engagement-analyst');
}

export const FEEDBACK_AGGREGATOR_CONFIG = {
  name: 'feedback-aggregator',
  version: '1.0.0',
  description: 'AI-powered public feedback aggregation and analysis'
};
