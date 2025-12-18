/**
 * Pilot Evaluation Gate Prompts
 * @module gates/pilotEvaluation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PILOT_EVALUATION_SYSTEM_PROMPT = getSystemPrompt('pilot_evaluation', `
You are a pilot evaluation specialist for Saudi municipal innovation programs.
Your role is to provide comprehensive assessments of completed pilots.
Evaluate outcomes, lessons learned, and scaling potential with bilingual support.
`);

/**
 * Build pilot evaluation prompt
 * @param {Object} params - Pilot data
 * @returns {string} Formatted prompt
 */
export function buildPilotEvaluationPrompt({ pilot }) {
  return `Evaluate this completed pilot and provide a comprehensive assessment:

Title: ${pilot?.title_en || 'Not specified'}
Sector: ${pilot?.sector || 'Not specified'}
Duration: ${pilot?.duration_months || 'Not specified'} months
Budget Used: ${pilot?.actual_budget || pilot?.budget || 0} SAR
Success Rate: ${pilot?.success_rate || 'N/A'}%

Provide bilingual evaluation:
1. Overall performance score (0-100)
2. Key achievements
3. Challenges encountered
4. Lessons learned
5. Scaling recommendation (yes/no with rationale)
6. Next steps`;
}

export const PILOT_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    performance_score: { type: "number" },
    achievements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          ar: { type: "string" }
        }
      }
    },
    challenges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          ar: { type: "string" }
        }
      }
    },
    lessons_learned: {
      type: "array",
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          ar: { type: "string" }
        }
      }
    },
    scaling_recommended: { type: "boolean" },
    scaling_rationale: {
      type: "object",
      properties: {
        en: { type: "string" },
        ar: { type: "string" }
      }
    },
    next_steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          en: { type: "string" },
          ar: { type: "string" }
        }
      }
    }
  }
};

export const PILOT_EVALUATION_PROMPTS = {
  systemPrompt: PILOT_EVALUATION_SYSTEM_PROMPT,
  buildPrompt: buildPilotEvaluationPrompt,
  schema: PILOT_EVALUATION_SCHEMA
};
