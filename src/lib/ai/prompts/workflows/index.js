/**
 * Workflow Prompts
 * AI prompts for workflow optimization
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const WORKFLOW_OPTIMIZER_SYSTEM_PROMPT = getSystemPrompt('workflow_optimizer', `
You are a workflow optimization expert for Saudi municipal innovation platforms.

OPTIMIZATION FOCUS:
1. Identify bottlenecks and inefficiencies
2. Suggest process improvements
3. Find automation opportunities
4. Optimize SLA timelines
`);

export function buildWorkflowOptimizerPrompt(workflowData) {
  return `Analyze this workflow and suggest optimizations:
Workflow: ${JSON.stringify(workflowData)}

Provide:
1. Bottleneck identification
2. Efficiency improvements
3. Suggested stage reductions or merges
4. SLA optimization
5. Automation opportunities`;
}

export const WORKFLOW_OPTIMIZER_SCHEMA = {
  type: 'object',
  properties: {
    bottlenecks: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          stage: { type: 'string' }, 
          issue: { type: 'string' }, 
          impact: { type: 'string' } 
        } 
      } 
    },
    improvements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          suggestion: { type: 'string' }, 
          benefit: { type: 'string' } 
        } 
      } 
    },
    efficiency_score: { type: 'number' },
    automation_opportunities: { type: 'array', items: { type: 'string' } }
  }
};
