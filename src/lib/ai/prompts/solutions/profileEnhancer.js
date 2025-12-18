/**
 * Solution Profile Enhancer Prompts
 * @module solutions/profileEnhancer
 * @version 1.1.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROFILE_ENHANCER_SYSTEM_PROMPT = getSystemPrompt('profile_enhancer', `
You are a solution profile optimization specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze solution profiles and suggest improvements to increase visibility and matching potential.
Consider Saudi market context, Vision 2030 alignment, and municipal procurement requirements.
`);

export function buildProfileEnhancerPrompt({ solution }) {
  return `Analyze this solution profile and suggest improvements:

SOLUTION: ${solution.name_en}
PROVIDER: ${solution.provider_name || 'N/A'}
DESCRIPTION: ${solution.description_en || 'N/A'}
FEATURES: ${solution.features?.length || 0}
CASE STUDIES: ${solution.case_studies?.length || 0}
CERTIFICATIONS: ${solution.certifications?.length || 0}
DEPLOYMENTS: ${solution.deployment_count || 0}

Provide:
1. Missing critical fields
2. Weak areas needing improvement
3. Competitive gaps (compared to top solutions)
4. Specific content suggestions
5. Impact of improvements on visibility/matching`;
}

export const PROFILE_ENHANCER_SCHEMA = {
  type: "object",
  properties: {
    completeness_score: { type: "number", minimum: 0, maximum: 100 },
    missing_fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          importance: { type: "string" },
          impact: { type: "string" }
        }
      }
    },
    weak_areas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          issue: { type: "string" },
          suggestion: { type: "string" }
        }
      }
    },
    competitive_gaps: { type: "array", items: { type: "string" } },
    quick_wins: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          estimated_impact: { type: "string" }
        }
      }
    }
  },
  required: ["completeness_score", "missing_fields"]
};

export const PROFILE_ENHANCER_PROMPTS = {
  systemPrompt: PROFILE_ENHANCER_SYSTEM_PROMPT,
  buildPrompt: buildProfileEnhancerPrompt,
  schema: PROFILE_ENHANCER_SCHEMA
};
