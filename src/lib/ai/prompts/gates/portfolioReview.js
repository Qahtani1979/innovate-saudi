/**
 * Portfolio Review Gate Prompts
 * @module gates/portfolioReview
 * @version 1.0.0
 */

import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const PORTFOLIO_REVIEW_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are a portfolio review specialist for Saudi municipal innovation programs.
Your role is to analyze quarterly performance and provide strategic recommendations.
Focus on KPI achievement, budget utilization, and pilot success rates.
`;

/**
 * Build portfolio review prompt
 * @param {Object} params - Performance metrics
 * @returns {string} Formatted prompt
 */
export function buildPortfolioReviewPrompt({ performanceMetrics }) {
  return `Perform quarterly portfolio review for Saudi municipal innovation:

Performance: ${JSON.stringify(performanceMetrics || [])}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Provide bilingual review:
1. Key achievements this quarter
2. Areas of concern
3. Recommendations for next quarter`;
}

export const PORTFOLIO_REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    achievements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        },
        required: ['en', 'ar']
      } 
    },
    concerns: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        },
        required: ['en', 'ar']
      } 
    },
    recommendations: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        },
        required: ['en', 'ar']
      } 
    }
  },
  required: ['achievements', 'concerns', 'recommendations']
};

export const PORTFOLIO_REVIEW_PROMPTS = {
  systemPrompt: PORTFOLIO_REVIEW_SYSTEM_PROMPT,
  buildPrompt: buildPortfolioReviewPrompt,
  schema: PORTFOLIO_REVIEW_SCHEMA
};
