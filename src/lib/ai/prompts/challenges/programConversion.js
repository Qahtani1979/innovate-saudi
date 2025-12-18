/**
 * Challenge to Program Conversion Prompts
 * @module challenges/programConversion
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROGRAM_CONVERSION_SYSTEM_PROMPT = getSystemPrompt('program_conversion', `
You are a program design specialist for Saudi municipal innovation.
Your role is to convert challenges into structured training/acceleration programs.
Focus on capacity building, skill development, and practical problem-solving approaches.
`);

/**
 * Build program conversion prompt
 * @param {Object} params - Challenge and program type data
 * @returns {string} Formatted prompt
 */
export function buildProgramConversionPrompt({ challenge, programType }) {
  return `Design a ${programType} program to address this challenge.

CHALLENGE:
Title: ${challenge?.title_en || challenge?.title || 'Unknown'}
Problem: ${challenge?.problem_statement_en || challenge?.description_en || ''}
Desired Outcome: ${challenge?.desired_outcome_en || ''}
Sector: ${challenge?.sector || 'general'}
Complexity: ${challenge?.challenge_type || 'standard'}

Program Type: ${programType}

Generate program design:
- Program name (bilingual) - compelling and sector-specific
- Objectives (bilingual) - address challenge
- Curriculum/Activities (6-10 modules for ${programType})
- Target participants (who needs to participate to solve this)
- Duration estimate
- Success metrics aligned with challenge KPIs

Make it actionable for ${programType} format.`;
}

export const PROGRAM_CONVERSION_SCHEMA = {
  type: "object",
  properties: {
    name_en: { type: "string" },
    name_ar: { type: "string" },
    tagline_en: { type: "string" },
    tagline_ar: { type: "string" },
    objectives_en: { type: "string" },
    objectives_ar: { type: "string" },
    curriculum: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "number" },
          topic_en: { type: "string" },
          topic_ar: { type: "string" },
          activities: { type: "array", items: { type: "string" } }
        }
      }
    },
    target_participants: {
      type: "object",
      properties: {
        type: { type: "array", items: { type: "string" } },
        min_participants: { type: "number" },
        max_participants: { type: "number" }
      }
    },
    duration_weeks: { type: "number" },
    success_metrics: { type: "array", items: { type: "string" } }
  },
  required: ["name_en", "objectives_en", "curriculum"]
};

export const PROGRAM_CONVERSION_PROMPTS = {
  systemPrompt: PROGRAM_CONVERSION_SYSTEM_PROMPT,
  buildPrompt: buildProgramConversionPrompt,
  schema: PROGRAM_CONVERSION_SCHEMA
};
