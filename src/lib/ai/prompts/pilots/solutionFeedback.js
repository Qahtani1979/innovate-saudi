/**
 * Solution Feedback Loop Prompts
 * @module pilots/solutionFeedback
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SOLUTION_FEEDBACK_SYSTEM_PROMPT = getSystemPrompt('solution_feedback', `
You are a solution improvement analyst for Saudi municipal innovation.
Your role is to analyze pilot results and generate actionable improvement recommendations.
Focus on feature enhancements, performance optimizations, and integration improvements.
`);

/**
 * Build solution feedback prompt
 * @param {Object} params - Pilot and solution data
 * @returns {string} Formatted prompt
 */
export function buildSolutionFeedbackPrompt({ pilot, solution }) {
  return `Analyze pilot results and generate solution improvement recommendations:

Pilot: ${pilot?.title_en || pilot?.name_en || 'Unknown'}
Solution: ${solution?.name_en || 'N/A'}
KPIs: ${pilot?.kpis?.map(k => `${k.name}: baseline ${k.baseline}, target ${k.target}, current ${k.current || 'N/A'}`).join('; ') || 'None'}
Issues: ${pilot?.issues?.map(i => i.issue).join('; ') || 'None'}
Lessons: ${pilot?.lessons_learned?.map(l => l.lesson).join('; ') || 'None'}
Evaluation: ${pilot?.evaluation_summary_en || 'In progress'}

Generate bilingual improvement recommendations:
1. Feature enhancements (3-5 items)
2. Performance optimizations (2-3 items)
3. Integration improvements (2-3 items)
4. Priority ranking`;
}

export const SOLUTION_FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    features: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    performance: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    integration: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    }
  }
};

export const SOLUTION_FEEDBACK_PROMPTS = {
  systemPrompt: SOLUTION_FEEDBACK_SYSTEM_PROMPT,
  buildPrompt: buildSolutionFeedbackPrompt,
  schema: SOLUTION_FEEDBACK_SCHEMA
};
