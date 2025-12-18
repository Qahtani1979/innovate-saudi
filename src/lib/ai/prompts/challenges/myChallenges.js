/**
 * My Challenges AI Prompts
 * Prompts for analyzing user's challenges and providing suggestions
 * @module ai/prompts/challenges/myChallenges
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Challenge Quick Suggestion Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const CHALLENGE_QUICK_SUGGESTION_PROMPT_TEMPLATE = ({
  title,
  description,
  status,
  sector,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Analyze this municipal challenge and provide quick actionable suggestions:

Title: ${title || 'N/A'}
Description: ${description?.substring(0, 200) || 'N/A'}
Status: ${status || 'N/A'}
Sector: ${sector || 'N/A'}

Provide:
1. Next recommended action
2. Priority level suggestion (keep/increase/decrease)
3. Track recommendation (pilot/r_and_d/program/procurement/policy)
4. One quick improvement tip

Consider Saudi Vision 2030 alignment and municipal context.`,
  system: `You are a Saudi municipal innovation advisor. Provide actionable, concise suggestions for improving challenge outcomes. Focus on practical next steps.`,
  schema: {
    type: 'object',
    properties: {
      next_action: { 
        type: 'string',
        description: 'Recommended next action for this challenge'
      },
      priority_suggestion: { 
        type: 'string',
        enum: ['keep', 'increase', 'decrease'],
        description: 'Whether to keep, increase, or decrease priority'
      },
      track_recommendation: { 
        type: 'string',
        enum: ['pilot', 'r_and_d', 'program', 'procurement', 'policy'],
        description: 'Recommended track for this challenge'
      },
      improvement_tip: { 
        type: 'string',
        description: 'One quick tip to improve the challenge'
      }
    },
    required: ['next_action', 'priority_suggestion', 'track_recommendation', 'improvement_tip']
  }
});

/**
 * Challenge Portfolio Analysis Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const CHALLENGE_PORTFOLIO_ANALYSIS_PROMPT_TEMPLATE = ({
  challenges,
  totalCount,
  statusBreakdown,
  sectorBreakdown,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Analyze this user's challenge portfolio:

Total Challenges: ${totalCount}
Status Breakdown: ${JSON.stringify(statusBreakdown)}
Sector Breakdown: ${JSON.stringify(sectorBreakdown)}

Challenge Summaries:
${challenges?.slice(0, 10).map(c => `- ${c.title_en} (${c.status}, ${c.sector})`).join('\n')}

Provide:
1. Portfolio health assessment
2. Focus recommendations
3. Key actions to take
4. Potential synergies between challenges`,
  system: `You are a Saudi municipal innovation portfolio advisor. Analyze challenge portfolios and provide strategic recommendations.`,
  schema: {
    type: 'object',
    properties: {
      portfolio_health: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          assessment: { type: 'string' }
        }
      },
      focus_recommendations: {
        type: 'array',
        items: { type: 'string' }
      },
      key_actions: {
        type: 'array',
        items: { type: 'string' }
      },
      synergies: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
});

export default {
  CHALLENGE_QUICK_SUGGESTION_PROMPT_TEMPLATE,
  CHALLENGE_PORTFOLIO_ANALYSIS_PROMPT_TEMPLATE
};
