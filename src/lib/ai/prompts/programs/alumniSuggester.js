/**
 * Alumni Next Steps Suggester Prompts
 * @module programs/alumniSuggester
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ALUMNI_SUGGESTER_SYSTEM_PROMPT = getSystemPrompt('alumni_suggester', `
You are a career development advisor for Saudi municipal innovation program graduates.
Your role is to analyze graduate profiles and suggest meaningful next steps.
Consider their skills, achievements, and the broader innovation ecosystem opportunities.
`);

/**
 * Build alumni suggestions prompt
 * @param {Object} params - Program and graduate data
 * @returns {string} Formatted prompt
 */
export function buildAlumniSuggesterPrompt({ program, graduates, alumni_outcomes }) {
  const graduatesSummary = graduates?.slice(0, 10).map(g => 
    `- ${g.name}: ${g.role || 'Graduate'}, Skills: ${g.skills?.join(', ') || 'N/A'}`
  ).join('\n') || 'No graduate data';

  return `Analyze program graduates and suggest next steps:

Program: ${program?.name_en || 'Unknown Program'}
Program Type: ${program?.program_type || 'N/A'}
Focus Area: ${program?.focus_area || 'N/A'}
Duration: ${program?.duration || 'N/A'}

RECENT GRADUATES:
${graduatesSummary}

PREVIOUS ALUMNI OUTCOMES:
${JSON.stringify(alumni_outcomes?.slice(0, 5) || [], null, 2)}

Suggest:
1. Career pathways for graduates
2. Recommended certifications/training
3. Networking opportunities
4. Mentorship programs
5. Leadership development tracks`;
}

export const ALUMNI_SUGGESTER_SCHEMA = {
  type: "object",
  properties: {
    career_pathways: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pathway: { type: "string" },
          description: { type: "string" },
          prerequisites: { type: "array", items: { type: "string" } },
          timeline: { type: "string" }
        }
      }
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          provider: { type: "string" },
          relevance: { type: "string" }
        }
      }
    },
    networking_opportunities: {
      type: "array",
      items: { type: "string" }
    },
    mentorship_recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          program_type: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    leadership_tracks: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["career_pathways", "certifications", "networking_opportunities"]
};

export const ALUMNI_SUGGESTER_PROMPTS = {
  systemPrompt: ALUMNI_SUGGESTER_SYSTEM_PROMPT,
  buildPrompt: buildAlumniSuggesterPrompt,
  schema: ALUMNI_SUGGESTER_SCHEMA
};
