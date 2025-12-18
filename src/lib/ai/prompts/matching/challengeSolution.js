/**
 * Challenge-Solution Matching Prompts
 * AI-powered matching and recommendations
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const CHALLENGE_SOLUTION_MATCHING_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are an expert in matching municipal challenges with innovative solutions. Analyze compatibility, feasibility, and potential impact for Saudi municipalities.`;

export const CHALLENGE_SOLUTION_MATCH_PROMPT_TEMPLATE = (challenge = {}, solutions = []) => `Match the following challenge with potential solutions:

CHALLENGE:
Title: ${challenge.title_en || ''}
Description: ${challenge.description_en || ''}
Sector: ${challenge.sector || ''}
Priority: ${challenge.priority || ''}
Budget: ${challenge.budget_estimate || 'Not specified'}

AVAILABLE SOLUTIONS:
${solutions.map((s, i) => `
${i + 1}. ${s.title_en || 'Untitled'}
   Description: ${s.description_en || ''}
   Sector: ${s.sector || ''}
   TRL: ${s.trl_level || 'Unknown'}
   Cost Range: ${s.cost_range || 'Unknown'}
`).join('\n')}

For each solution, provide:
1. Match score (0-100)
2. Key strengths for this challenge
3. Potential gaps or risks
4. Implementation considerations
5. Overall recommendation`;

export const CHALLENGE_SOLUTION_MATCH_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          solution_index: { type: 'number' },
          match_score: { type: 'number' },
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          implementation_notes: { type: 'string' },
          recommendation: { type: 'string', enum: ['highly_recommended', 'recommended', 'conditional', 'not_recommended'] }
        }
      }
    },
    best_match_index: { type: 'number' },
    overall_assessment: { type: 'string' }
  }
};

export default {
  CHALLENGE_SOLUTION_MATCHING_SYSTEM_PROMPT,
  CHALLENGE_SOLUTION_MATCH_PROMPT_TEMPLATE,
  CHALLENGE_SOLUTION_MATCH_RESPONSE_SCHEMA
};
