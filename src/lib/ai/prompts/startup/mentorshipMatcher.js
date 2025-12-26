/**
 * Startup Mentorship Matcher Prompts
 * @module startup/mentorshipMatcher
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MENTORSHIP_MATCHER_SYSTEM_PROMPT = getSystemPrompt('startup_mentorship', `
You are a mentorship matching specialist for Saudi municipal innovation startups.
Match startups with suitable mentors based on sector expertise, growth stage, and goals.
`);

/**
 * Build mentorship matching prompt
 * @param {Object} params - Startup and mentor data
 * @returns {string} Formatted prompt
 */
export function buildMentorshipMatcherPrompt({ startup, availableMentors, goals }) {
  return `Match this startup with suitable mentors:

STARTUP: ${startup?.name_en || 'Unknown'}
SECTOR: ${startup?.sectors?.join(', ') || 'general'}
STAGE: ${startup?.funding_stage || 'early'}
TEAM SIZE: ${startup?.team_size || 'N/A'}
MUNICIPAL EXPERIENCE: ${startup?.municipal_clients_count || 0} clients

GOALS:
${goals?.map(g => `- ${g}`).join('\n') || 'General mentorship'}

AVAILABLE MENTORS (${availableMentors?.length || 0}):
${availableMentors?.slice(0, 10).map(m => 
  `- ${m.name}: ${m.expertise_areas?.join(', ')} | ${m.sector_specializations?.join(', ')} | ${m.availability_hours_per_month}h/month`
).join('\n') || 'None available'}

Recommend:
1. Top 3 mentor matches with scores
2. Matching rationale for each
3. Recommended focus areas
4. Meeting frequency suggestion`;
}

export const MENTORSHIP_MATCHER_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          mentor_name: { type: "string" },
          match_score: { type: "number" },
          rationale: { type: "string" },
          focus_areas: { type: "array", items: { type: "string" } }
        }
      }
    },
    recommended_frequency: { type: "string" },
    success_factors: { type: "array", items: { type: "string" } }
  },
  required: ["matches"]
};

export const MENTORSHIP_MATCHER_PROMPTS = {
  systemPrompt: MENTORSHIP_MATCHER_SYSTEM_PROMPT,
  buildPrompt: buildMentorshipMatcherPrompt,
  schema: MENTORSHIP_MATCHER_SCHEMA
};

export default MENTORSHIP_MATCHER_PROMPTS;
