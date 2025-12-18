/**
 * Evaluation Assistance Prompts
 * AI-assisted expert evaluation suggestions
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const EVALUATION_ASSIST_SYSTEM_PROMPT = getSystemPrompt('evaluation_assist', `
You are an expert evaluator for Saudi municipal innovation initiatives.
Provide thorough, constructive evaluation suggestions based on best practices.
`);

/**
 * Build evaluation assistance prompt
 */
export function buildEvaluationAssistPrompt(entityType, entityId) {
  return `You are evaluating a ${entityType} (ID: ${entityId}).
        
Based on best practices, suggest:
1. Evaluation scores (0-100) for: feasibility, impact, innovation, cost-effectiveness, risk, strategic alignment
2. 3 key strengths
3. 3 key weaknesses  
4. 3 improvement suggestions
5. Overall recommendation

Be thorough and constructive.`;
}

export const EVALUATION_ASSIST_SCHEMA = {
  type: 'object',
  properties: {
    scores: {
      type: 'object',
      properties: {
        feasibility_score: { type: 'number', description: 'Score 0-100' },
        impact_score: { type: 'number', description: 'Score 0-100' },
        innovation_score: { type: 'number', description: 'Score 0-100' },
        cost_effectiveness_score: { type: 'number', description: 'Score 0-100' },
        risk_score: { type: 'number', description: 'Score 0-100' },
        strategic_alignment_score: { type: 'number', description: 'Score 0-100' }
      }
    },
    strengths: { type: 'array', items: { type: 'string' }, description: '3 key strengths' },
    weaknesses: { type: 'array', items: { type: 'string' }, description: '3 key weaknesses' },
    improvements: { type: 'array', items: { type: 'string' }, description: '3 improvement suggestions' },
    recommendation: { type: 'string', description: 'Overall recommendation' },
    feedback: { type: 'string', description: 'Detailed feedback text' }
  }
};
