/**
 * Curriculum Generator Prompt
 * Designs comprehensive program curricula
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build curriculum generator prompt
 */
export function buildCurriculumPrompt(programType, durationWeeks, objectives) {
  return `${SAUDI_CONTEXT.INNOVATION}

You are an AI curriculum design specialist for Saudi Arabia's innovation programs.

PROGRAM DETAILS:
- Type: ${programType || 'Innovation Accelerator'}
- Duration: ${durationWeeks || 12} weeks
- Objectives: ${objectives || 'General innovation and entrepreneurship training'}

TASK: Design a comprehensive week-by-week curriculum.

FOR EACH WEEK, INCLUDE:
1. Week number (1-${durationWeeks || 12})
2. Topic title (English + Arabic)
3. Learning objectives (3-5 specific, measurable outcomes)
4. Activities (workshops, mentoring sessions, assignments)
5. Deliverables (what participants should produce)

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Align with Saudi Vision 2030 priorities and municipal innovation needs.
Make content practical and actionable for Saudi entrepreneurs.`;
}

/**
 * Get response schema for curriculum
 */
export function getCurriculumSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      curriculum: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            week: { type: 'number', description: 'Week number' },
            topic_en: { type: 'string', description: 'English topic' },
            topic_ar: { type: 'string', description: 'Arabic topic' },
            objectives: { type: 'array', items: { type: 'string' }, description: 'Learning objectives' },
            objectives_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic objectives' },
            activities: { type: 'array', items: { type: 'string' }, description: 'Week activities' },
            activities_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic activities' },
            deliverables: { type: 'array', items: { type: 'string' }, description: 'Expected deliverables' },
            deliverables_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic deliverables' }
          },
          required: ['week', 'topic_en', 'topic_ar', 'objectives', 'activities', 'deliverables']
        }
      }
    },
    required: ['curriculum']
  });
}

export const CURRICULUM_GENERATOR_SYSTEM_PROMPT = `You are an AI curriculum design specialist for Saudi Arabia's innovation programs. You create practical, comprehensive training curricula aligned with Vision 2030 and municipal innovation priorities. Always provide bilingual content.`;
