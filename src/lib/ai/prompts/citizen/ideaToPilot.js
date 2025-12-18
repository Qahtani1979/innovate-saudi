/**
 * Idea to Pilot Conversion Prompts
 * @module citizen/ideaToPilot
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IDEA_TO_PILOT_SYSTEM_PROMPT = getSystemPrompt('idea_to_pilot', `
You are a pilot design specialist for Saudi Arabia's municipal innovation platform.
Your role is to convert citizen ideas into structured pilot proposals with clear success metrics.
Generate bilingual content (English and Arabic) and ensure pilot design follows best practices for municipal innovation.
`);

export function buildIdeaToPilotPrompt({ idea }) {
  return `Convert this citizen idea into a pilot proposal:

Idea: ${idea.title}
Description: ${idea.description}
Category: ${idea.category || 'General'}
Votes: ${idea.votes_count || 0}

Generate:
1. Pilot title (EN & AR)
2. Problem statement (EN & AR)
3. Proposed solution (EN & AR)
4. Success criteria (measurable KPIs)
5. Timeline (phases)
6. Resource requirements
7. Risk factors`;
}

export const IDEA_TO_PILOT_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    problem_statement_en: { type: 'string' },
    problem_statement_ar: { type: 'string' },
    proposed_solution_en: { type: 'string' },
    proposed_solution_ar: { type: 'string' },
    success_criteria: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          metric: { type: 'string' },
          target: { type: 'string' }
        }
      }
    },
    timeline_phases: { type: 'array', items: { type: 'string' } },
    resources: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    duration_months: { type: 'number' },
    budget_estimate: { type: 'number' }
  },
  required: ['title_en', 'title_ar', 'problem_statement_en', 'proposed_solution_en', 'success_criteria']
};

export const IDEA_TO_PILOT_PROMPTS = {
  systemPrompt: IDEA_TO_PILOT_SYSTEM_PROMPT,
  buildPrompt: buildIdeaToPilotPrompt,
  schema: IDEA_TO_PILOT_SCHEMA
};
