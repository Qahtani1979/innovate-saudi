/**
 * Onboarding Prompts
 * AI prompts for profile completion and onboarding
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// Profile completeness prompts
export const PROFILE_COMPLETENESS_SYSTEM_PROMPT = getSystemPrompt('profile_completeness', `
You are a profile optimization coach for Saudi municipal innovation platforms.

COACHING GUIDELINES:
1. Identify high-impact profile fields
2. Provide role-specific recommendations
3. Give concrete examples for each field
4. Prioritize fields that improve visibility
`);

export function buildProfileCompletenessPrompt(profile, role, completeness) {
  return `Provide profile completion suggestions:

ROLE: ${role}
CURRENT PROFILE: ${JSON.stringify(profile || {})}
COMPLETENESS: ${completeness}%

Suggest:
1. Top 3 most impactful fields to complete
2. Why each field matters
3. Example content for each field
4. Priority ranking`;
}

export const PROFILE_COMPLETENESS_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          importance: { type: "string" },
          impact_description: { type: "string" },
          example: { type: "string" }
        }
      }
    }
  }
};

// Re-export from sub-modules
export * from './translationPrompts';
export * from './linkedinImport';
export * from './profileSuggestions';
