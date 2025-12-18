/**
 * Role Assignment Prompts
 * @module onboarding/roleAssigner
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ROLE_ASSIGNER_SYSTEM_PROMPT = getSystemPrompt('role_assigner', `
You are a role assignment specialist for Saudi municipal innovation platform.
Your role is to recommend appropriate platform roles based on user profiles.
Consider organization type, experience, and stated interests.
`);

/**
 * Build role assignment prompt
 * @param {Object} params - User profile data
 * @returns {string} Formatted prompt
 */
export function buildRoleAssignerPrompt({ userProfile, organizationType, interests, experience }) {
  return `Recommend platform role for new user:

User: ${userProfile?.name || userProfile?.email || 'Unknown'}
Organization Type: ${organizationType || 'Not specified'}
Interests: ${interests?.join(', ') || 'Not specified'}
Experience Level: ${experience || 'Not specified'}

Available Roles:
- municipality_officer: Municipal innovation officers
- provider: Solution providers and startups
- citizen: Engaged citizens
- researcher: Academic researchers
- program_manager: Program administrators
- evaluator: Independent evaluators
- observer: Observers with limited access

Recommend:
1. Primary role
2. Secondary role (if applicable)
3. Suggested capabilities to enable
4. Recommended onboarding path`;
}

export const ROLE_ASSIGNER_SCHEMA = {
  type: "object",
  properties: {
    primary_role: { type: "string" },
    secondary_role: { type: "string" },
    capabilities: { type: "array", items: { type: "string" } },
    onboarding_path: { type: "string" },
    rationale: { type: "string" }
  }
};

export const ROLE_ASSIGNER_PROMPTS = {
  systemPrompt: ROLE_ASSIGNER_SYSTEM_PROMPT,
  buildPrompt: buildRoleAssignerPrompt,
  schema: ROLE_ASSIGNER_SCHEMA
};
