/**
 * Command Center Prompt Module
 * Strategic recommendations for platform leadership
 * @module prompts/command/strategicRecommendations
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

/**
 * Schema for command center recommendations response
 */
export const COMMAND_CENTER_SCHEMA = {
  type: 'object',
  properties: {
    priority_actions: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Top priority actions for leadership'
    },
    priority_actions_ar: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Arabic priority actions'
    },
    resource_recommendations: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Resource allocation recommendations'
    },
    resource_recommendations_ar: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Arabic resource recommendations'
    },
    risk_priorities: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Risk mitigation priorities'
    },
    risk_priorities_ar: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Arabic risk priorities'
    },
    opportunities: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Opportunities to accelerate'
    },
    opportunities_ar: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Arabic opportunities'
    }
  },
  required: ['priority_actions', 'resource_recommendations', 'risk_priorities', 'opportunities']
};

/**
 * Command center recommendations prompt template
 * @param {Object} context - Platform status context
 * @returns {string} Formatted prompt
 */
export function COMMAND_CENTER_PROMPT_TEMPLATE(context) {
  const { criticalChallenges, highRiskPilots, activeOperations, pendingApprovals } = context;
  
  return `Analyze this innovation platform status and provide strategic recommendations:

${SAUDI_CONTEXT.FULL}

Critical challenges: ${criticalChallenges}
High-risk pilots: ${highRiskPilots}
Active operations: ${activeOperations}
Pending approvals: ${pendingApprovals}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Provide:
1. Top 3 priority actions for platform leadership
2. Resource allocation recommendations
3. Risk mitigation priorities
4. Opportunities to accelerate`;
}

/**
 * Command center system prompt
 */
export const COMMAND_CENTER_SYSTEM_PROMPT = `You are a strategic advisor for Saudi Arabia's national municipal innovation platform.

Your role is to analyze platform metrics and provide executive-level recommendations that:
- Prioritize actions based on impact and urgency
- Optimize resource allocation across the portfolio
- Identify and mitigate systemic risks
- Highlight opportunities for acceleration and scale

Focus on actionable, measurable recommendations aligned with Vision 2030.`;

export default {
  COMMAND_CENTER_PROMPT_TEMPLATE,
  COMMAND_CENTER_SCHEMA,
  COMMAND_CENTER_SYSTEM_PROMPT
};
