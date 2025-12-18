/**
 * Strategic Alignment Validator Prompts
 * @module challenges/strategicAlignment
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const STRATEGIC_ALIGNMENT_SYSTEM_PROMPT = getSystemPrompt('challenges_strategic_alignment');

export const buildStrategicAlignmentPrompt = (challenge, selectedPlanObjects) => `Validate strategic alignment between challenge and objectives:

Challenge: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}

Strategic Objectives Selected:
${selectedPlanObjects.map(p => `- ${p.objective_en || p.title_en}: ${p.description_en}`).join('\n')}

Analyze:
1. Alignment score (0-100) for each objective
2. How this challenge contributes to objectives
3. Potential gaps or misalignments
4. Recommendations to strengthen alignment`;

export const STRATEGIC_ALIGNMENT_SCHEMA = {
  type: 'object',
  properties: {
    alignments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          objective: { type: 'string' },
          score: { type: 'number' },
          contribution: { type: 'string' },
          gaps: { type: 'string' }
        }
      }
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['alignments', 'recommendations']
};

export const STRATEGIC_ALIGNMENT_PROMPTS = {
  systemPrompt: STRATEGIC_ALIGNMENT_SYSTEM_PROMPT,
  buildPrompt: buildStrategicAlignmentPrompt,
  schema: STRATEGIC_ALIGNMENT_SCHEMA
};

export default STRATEGIC_ALIGNMENT_PROMPTS;
