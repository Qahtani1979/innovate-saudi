/**
 * Workload Prioritization Prompt Module
 * AI-powered workload analysis and priority recommendations
 * @module prompts/workload/prioritization
 */

/**
 * Schema for workload prioritization response
 */
export const WORKLOAD_PRIORITIES_SCHEMA = {
  type: 'object',
  properties: {
    priorities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          urgency_reason: { type: 'string' },
          recommended_action: { type: 'string' },
          estimated_minutes: { type: 'number' }
        }
      }
    }
  }
};

/**
 * Workload prioritization prompt template
 * @param {Object} context - Work items context
 * @returns {string} Formatted prompt
 */
export function WORKLOAD_PRIORITIES_PROMPT_TEMPLATE(context) {
  const { workItems } = context;
  
  return `Analyze this user's workload and identify top 3 priorities for TODAY with clear reasoning:

Work items: ${JSON.stringify(workItems.slice(0, 20))}

For each priority, provide:
1. What item needs attention
2. Why it's urgent/important
3. Recommended action
4. Estimated time needed`;
}

/**
 * Format work items for prioritization
 * @param {Object} data - User's work data
 * @returns {Array} Formatted work items
 */
export function formatWorkItemsForPrioritization(data) {
  const { challenges = [], pilots = [], tasks = [] } = data;
  
  return [
    ...challenges.map(c => ({ 
      type: 'challenge', 
      code: c.code, 
      title: c.title_en, 
      status: c.status, 
      priority: c.priority 
    })),
    ...pilots.map(p => ({ 
      type: 'pilot', 
      code: p.code, 
      title: p.title_en, 
      stage: p.stage 
    })),
    ...tasks.filter(t => t.status !== 'completed').map(t => ({ 
      type: 'task', 
      title: t.title, 
      due_date: t.due_date, 
      priority: t.priority 
    }))
  ];
}

/**
 * Workload prioritization system prompt
 */
export const WORKLOAD_PRIORITIES_SYSTEM_PROMPT = `You are a productivity assistant helping innovation platform users prioritize their daily workload.

Focus on:
- Urgent items with approaching deadlines
- High-priority items that impact others
- Items at risk of delays or escalation
- Quick wins that can be completed efficiently

Provide practical, actionable recommendations.`;

export default {
  WORKLOAD_PRIORITIES_PROMPT_TEMPLATE,
  WORKLOAD_PRIORITIES_SCHEMA,
  WORKLOAD_PRIORITIES_SYSTEM_PROMPT,
  formatWorkItemsForPrioritization
};
