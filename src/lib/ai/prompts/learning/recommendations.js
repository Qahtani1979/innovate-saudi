/**
 * Learning Recommendations Prompts
 * AI-powered personalized learning path generation
 * @module prompts/learning/recommendations
 */

/**
 * Learning recommendations prompt template
 * @param {Object} data - User activity data
 * @returns {string} Formatted prompt
 */
export const LEARNING_RECOMMENDATIONS_PROMPT_TEMPLATE = (data) => `
Based on this user's activity, recommend learning resources:

Role: ${data.role || 'User'}
Challenges created: ${data.challengesCount || 0}
Pilots launched: ${data.pilotsCount || 0}
Challenge→Pilot conversion: ${data.conversionRate || 0}%

Identify skill gaps and recommend 5 learning topics to improve performance. For each:
1. Topic name
2. Why needed (skill gap identified)
3. Expected improvement
4. Priority (high/medium/low)
`;

/**
 * Response schema for learning recommendations
 */
export const LEARNING_RECOMMENDATIONS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          skill_gap: { type: 'string' },
          expected_improvement: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    }
  }
};

/**
 * System prompt for learning recommendations
 */
export const LEARNING_RECOMMENDATIONS_SYSTEM_PROMPT = `You are a learning and development expert specializing in municipal innovation and government transformation. Provide personalized learning recommendations based on user activity patterns.`;

export default {
  LEARNING_RECOMMENDATIONS_PROMPT_TEMPLATE,
  LEARNING_RECOMMENDATIONS_RESPONSE_SCHEMA,
  LEARNING_RECOMMENDATIONS_SYSTEM_PROMPT
};
