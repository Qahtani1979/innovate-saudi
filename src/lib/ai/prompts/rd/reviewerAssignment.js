/**
 * Reviewer Assignment Prompts
 * AI-powered reviewer auto-assignment for R&D proposals
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for reviewer assignment
 */
export const REVIEWER_ASSIGNMENT_SYSTEM_PROMPT = getSystemPrompt('reviewer_assignment', `
You are an expert R&D proposal reviewer assignment system for Saudi municipal innovation.

ASSIGNMENT RULES:
1. Each proposal should have 2-3 reviewers
2. Balance workload across reviewers
3. Match reviewer expertise with proposal research area
4. Avoid conflicts of interest (same institution)
5. Ensure diversity in reviewer panels
`);

/**
 * Build reviewer assignment prompt
 * @param {Object} params - Assignment parameters
 * @returns {string} Formatted prompt
 */
export function buildReviewerAssignmentPrompt({ rdCall, users, proposals }) {
  const reviewers = users.filter(u => u.role === 'admin' || u.email.includes('reviewer'));
  
  return `You are an expert R&D proposal reviewer assignment system for Saudi municipal innovation.

R&D Call: ${rdCall.title_en}
Focus Areas: ${rdCall.focus_areas?.join(', ') || 'N/A'}
Sector: ${rdCall.sector || 'N/A'}

Available Reviewers (Users):
${reviewers.map((u, i) => `${i+1}. ${u.full_name} (${u.email})`).join('\n')}

Proposals to Assign (${proposals.length}):
${proposals.map((p, i) => 
  `${i+1}. ${p.title_en}
   - Research Area: ${p.research_area_en}
   - Themes: ${p.research_themes?.join(', ') || 'N/A'}
   - Institution: ${p.lead_institution_en}
`).join('\n')}

ASSIGNMENT RULES:
1. Each proposal should have 2-3 reviewers
2. Balance workload across reviewers (similar number of proposals each)
3. Match reviewer expertise with proposal research area when possible
4. Avoid conflicts of interest (same institution)
5. Ensure diversity in reviewer panels

Return assignments with reasoning.`;
}

/**
 * Response schema for reviewer assignment
 */
export const REVIEWER_ASSIGNMENT_SCHEMA = {
  type: 'object',
  properties: {
    assignments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          proposal_code: { type: 'string' },
          proposal_title: { type: 'string' },
          assigned_reviewers: {
            type: 'array',
            items: { type: 'string' }
          },
          reasoning: { type: 'string' }
        }
      }
    },
    workload_balance: { type: 'object' }
  }
};
