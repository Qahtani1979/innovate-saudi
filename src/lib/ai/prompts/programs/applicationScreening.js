/**
 * Program Application Screening Prompts
 * @module programs/applicationScreening
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const APPLICATION_SCREENING_SYSTEM_PROMPT = getSystemPrompt('programs_screening');

export const buildApplicationScreeningPrompt = (program, applications) => `You are an expert application screener for Saudi municipal innovation programs.

Program: ${program.name_en}
Type: ${program.program_type}
Focus Areas: ${program.focus_areas?.join(', ') || 'N/A'}
Eligibility: ${program.eligibility_criteria?.join(', ') || 'N/A'}
Max Participants: ${program.target_participants?.max_participants || 'N/A'}

Applications to Score (${applications.length}):
${applications.map((app, i) => 
  `${i+1}. Applicant: ${app.applicant_name}
   Organization: ${app.organization_name}
   Type: ${app.organization_type}
   Motivation: ${app.motivation?.substring(0, 150) || 'N/A'}
   Experience: ${app.relevant_experience?.substring(0, 100) || 'N/A'}
`).join('\n')}

SCORING CRITERIA (0-100 each):
1. Eligibility compliance
2. Alignment with program focus
3. Organization readiness
4. Innovation potential
5. Commitment level

Return scored applications with total scores, reasoning, and recommendation (accept/waitlist/reject).`;

export const APPLICATION_SCREENING_SCHEMA = {
  type: 'object',
  properties: {
    scored_applications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          applicant_name: { type: 'string' },
          scores: {
            type: 'object',
            properties: {
              eligibility: { type: 'number' },
              alignment: { type: 'number' },
              readiness: { type: 'number' },
              innovation: { type: 'number' },
              commitment: { type: 'number' }
            }
          },
          total_score: { type: 'number' },
          reasoning: { type: 'string' },
          recommendation: { type: 'string' }
        }
      }
    }
  }
};

export const APPLICATION_SCREENING_PROMPTS = {
  systemPrompt: APPLICATION_SCREENING_SYSTEM_PROMPT,
  buildPrompt: buildApplicationScreeningPrompt,
  schema: APPLICATION_SCREENING_SCHEMA
};

export default APPLICATION_SCREENING_PROMPTS;
