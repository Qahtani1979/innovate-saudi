/**
 * Program Lessons to Strategy Prompts
 * @module programs/lessonsStrategy
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const LESSONS_STRATEGY_SYSTEM_PROMPT = getSystemPrompt('lessons_strategy', `
You are a strategic learning analyst for Saudi Arabia's municipal innovation platform.
Your role is to synthesize program lessons learned into strategic recommendations.
Generate bilingual (English/Arabic) recommendations for strategy refinement.
`);

/**
 * Build lessons to strategy prompt
 * @param {Object} params - Program and lessons data
 * @returns {string} Formatted prompt
 */
export function buildLessonsStrategyPrompt({ program, successLessons, challengeLessons, improvementLessons, linkedPlans }) {
  return `Analyze these lessons learned from a municipal innovation program and generate strategic recommendations:

PROGRAM: ${program?.name_en || 'Unknown'}
TYPE: ${program?.program_type || 'N/A'}
STATUS: ${program?.status || 'N/A'}
LINKED STRATEGIC PLANS: ${linkedPlans?.map(p => p.name_en || p.title_en).join(', ') || 'None'}

SUCCESS LESSONS:
${successLessons?.map(l => `- ${l.description}`).join('\n') || 'None recorded'}

CHALLENGES/FAILURES:
${challengeLessons?.map(l => `- ${l.description}`).join('\n') || 'None recorded'}

IMPROVEMENTS:
${improvementLessons?.map(l => `- ${l.description}`).join('\n') || 'None recorded'}

Generate bilingual strategic recommendations:
1. Strategy refinement suggestions (what should change in strategic plans)
2. Capacity building needs (skills/resources to develop)
3. Process improvements (how to improve program execution)
4. Replication opportunities (where else to apply learnings)`;
}

export const LESSONS_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    strategy_refinements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    capacity_needs: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    process_improvements: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    replication_opportunities: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    }
  },
  required: ['strategy_refinements', 'capacity_needs', 'process_improvements', 'replication_opportunities']
};

export const LESSONS_STRATEGY_PROMPTS = {
  systemPrompt: LESSONS_STRATEGY_SYSTEM_PROMPT,
  buildPrompt: buildLessonsStrategyPrompt,
  schema: LESSONS_STRATEGY_SCHEMA
};
