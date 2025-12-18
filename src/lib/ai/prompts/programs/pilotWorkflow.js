/**
 * Program to Pilot Conversion Prompts
 * @module programs/pilotWorkflow
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROGRAM_PILOT_SYSTEM_PROMPT = getSystemPrompt('program_pilot', `
You are a pilot proposal generator for Saudi municipal innovation programs.
Your role is to create pilot proposals for program graduates ready to test innovations.
Focus on practical, measurable pilot designs with clear hypotheses and methodologies.
`);

/**
 * Build program to pilot conversion prompt
 * @param {Object} params - Program and graduate data
 * @returns {string} Formatted prompt
 */
export function buildProgramPilotPrompt({ program, graduateApplication }) {
  return `Graduate from "${program?.name_en || 'Unknown Program'}" wants to pilot their innovation:

Graduate: ${graduateApplication?.applicant_name || 'Unknown'}
Project: ${graduateApplication?.project_description || 'Innovation project'}
Program Focus: ${program?.focus_areas?.join(', ') || 'General innovation'}

Generate pilot proposal:
1. Title (English and Arabic)
2. Description (English and Arabic)
3. Objective (English and Arabic)
4. Hypothesis
5. Methodology`;
}

export const PROGRAM_PILOT_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    objective_en: { type: 'string' },
    objective_ar: { type: 'string' },
    hypothesis: { type: 'string' },
    methodology: { type: 'string' }
  }
};

export const PROGRAM_PILOT_PROMPTS = {
  systemPrompt: PROGRAM_PILOT_SYSTEM_PROMPT,
  buildPrompt: buildProgramPilotPrompt,
  schema: PROGRAM_PILOT_SCHEMA
};
