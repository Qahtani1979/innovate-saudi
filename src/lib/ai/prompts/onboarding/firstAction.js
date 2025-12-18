/**
 * First Action Recommender Prompts
 * @module onboarding/firstAction
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const FIRST_ACTION_SYSTEM_PROMPT = getSystemPrompt('first_action', `
You are an onboarding specialist for Saudi Arabia's municipal innovation platform.
Your role is to recommend the most impactful first actions for new users based on their role.
Consider user context, available opportunities, and platform capabilities.
Provide actionable, role-appropriate recommendations aligned with Vision 2030 goals.
`);

/**
 * Build first action recommendation prompt
 * @param {Object} params - User and context details
 * @returns {string} Formatted prompt
 */
export function buildFirstActionPrompt({ userRole, emailDomain, challenges, rdCalls }) {
  return `Recommend the most impactful first action for this specific user:

User Role: ${userRole}
User Email Domain: ${emailDomain || 'unknown'}
Available Challenges: ${challenges || 'None'}
Available R&D Calls: ${rdCalls || 'None'}

IMPORTANT: Tailor recommendations specifically for "${userRole}" role:
- citizen/user: Submit ideas, vote on community ideas, browse public pilots, attend events
- viewer: Browse public content, view events, read news
- municipality_admin: Submit challenges, manage pilots, review city data
- startup_user: Browse challenges, submit proposals, complete solution profiles
- researcher: Explore R&D calls, join living labs, complete researcher profile
- admin: Review pending submissions, check system health, view analytics

Return page names from this list only:
- CitizenIdeaSubmission, PublicIdeasBoard, PublicPilotTracker, EventCalendar (for citizens/users)
- Challenges, SolutionCreate, MatchmakerJourney (for startups)
- RDCalls, ResearcherProfile, LivingLabs (for researchers)
- ChallengeCreate, Pilots, MunicipalityDashboard (for municipality)
- ChallengeReviewQueue, SystemHealthDashboard, ExecutiveDashboard (for admins)`;
}

export const FIRST_ACTION_SCHEMA = {
  type: "object",
  properties: {
    primary: {
      type: "object",
      properties: {
        action: { type: "string" },
        reason: { type: "string" },
        page: { type: "string" }
      },
      required: ["action", "reason", "page"]
    },
    secondary: {
      type: "object",
      properties: {
        action: { type: "string" },
        reason: { type: "string" },
        page: { type: "string" }
      }
    },
    quick_win: {
      type: "object",
      properties: {
        action: { type: "string" },
        reason: { type: "string" },
        page: { type: "string" }
      }
    }
  },
  required: ["primary"]
};

export const FIRST_ACTION_PROMPTS = {
  systemPrompt: FIRST_ACTION_SYSTEM_PROMPT,
  buildPrompt: buildFirstActionPrompt,
  schema: FIRST_ACTION_SCHEMA
};
