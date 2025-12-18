/**
 * Mentor Matching Engine Prompts
 * @module programs/mentorMatching
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MENTOR_MATCHING_SYSTEM_PROMPT = getSystemPrompt('mentor_matching', `
You are a mentor matching specialist for Saudi Arabia's startup accelerator programs.
Your role is to match startups with ideal mentors based on sector alignment, expertise, and needs.
Create meaningful connections that accelerate startup growth aligned with Vision 2030.
`);

/**
 * Build mentor matching prompt
 * @param {Object} params - Participants and mentors data
 * @returns {string} Formatted prompt
 */
export function buildMentorMatchingPrompt({ participants, mentors }) {
  return `Match ${participants?.length || 0} startups with ${mentors?.length || 0} mentors:

STARTUPS (sample):
${participants?.slice(0, 10).map(p => `- ${p.startup_name}: ${p.sector}, ${p.startup_stage}, Needs: ${p.mentorship_needs || 'general guidance'}`).join('\n') || 'None'}

MENTORS (sample):
${mentors?.slice(0, 10).map(m => `- ${m.name}: Expertise in ${m.expertise_areas?.join(', ') || 'general'}, ${m.years_experience || 0} years`).join('\n') || 'None'}

For each startup, suggest best 2 mentors considering:
1. Sector alignment
2. Stage expertise
3. Specific needs match
4. Mentor availability`;
}

export const MENTOR_MATCHING_SCHEMA = {
  type: 'object',
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          startup: { type: 'string' },
          mentor_1: { type: 'string' },
          mentor_2: { type: 'string' },
          rationale_1: { type: 'string' },
          rationale_2: { type: 'string' },
          match_score: { type: 'number' }
        }
      }
    }
  },
  required: ['matches']
};

export const MENTOR_MATCHING_PROMPTS = {
  systemPrompt: MENTOR_MATCHING_SYSTEM_PROMPT,
  buildPrompt: buildMentorMatchingPrompt,
  schema: MENTOR_MATCHING_SCHEMA
};
