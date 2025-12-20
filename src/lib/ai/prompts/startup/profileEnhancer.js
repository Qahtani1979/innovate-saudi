/**
 * Startup Profile Enhancer Prompts
 * @module startup/profileEnhancer
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROFILE_ENHANCER_SYSTEM_PROMPT = getSystemPrompt('startup_profile', `
You are a startup profile enhancement specialist for Saudi municipal innovation.
Help startups create compelling profiles that highlight their municipal solutions capabilities.
Focus on municipal relevance, not VC pitch language.
`);

/**
 * Build profile enhancement prompt
 * @param {Object} params - Startup profile data
 * @returns {string} Formatted prompt
 */
export function buildProfileEnhancerPrompt({ startup, solutions, pilots }) {
  return `Enhance this startup's municipal innovation profile:

CURRENT PROFILE:
Company: ${startup?.name_en || 'Unknown'}
Description: ${startup?.description_en || 'Not provided'}
Sectors: ${startup?.sectors?.join(', ') || 'Not specified'}
Stage: ${startup?.funding_stage || 'Unknown'}

SOLUTIONS (${solutions?.length || 0}):
${solutions?.slice(0, 5).map(s => `- ${s.name_en}: ${s.description_en?.substring(0, 100)}`).join('\n') || 'None'}

PILOT HISTORY (${pilots?.length || 0}):
${pilots?.slice(0, 3).map(p => `- ${p.title_en}: ${p.status}`).join('\n') || 'None'}

Generate:
1. Enhanced description (municipal focus, not VC pitch)
2. Key differentiators (3-5 points)
3. Municipal value proposition
4. Suggested keywords for matching
5. Profile completeness suggestions`;
}

export const PROFILE_ENHANCER_SCHEMA = {
  type: "object",
  properties: {
    enhanced_description_en: { type: "string" },
    enhanced_description_ar: { type: "string" },
    key_differentiators: { type: "array", items: { type: "string" } },
    municipal_value_proposition: { type: "string" },
    suggested_keywords: { type: "array", items: { type: "string" } },
    completeness_suggestions: { type: "array", items: { type: "string" } }
  },
  required: ["enhanced_description_en", "key_differentiators", "municipal_value_proposition"]
};

export const PROFILE_ENHANCER_PROMPTS = {
  systemPrompt: PROFILE_ENHANCER_SYSTEM_PROMPT,
  buildPrompt: buildProfileEnhancerPrompt,
  schema: PROFILE_ENHANCER_SCHEMA
};

export default PROFILE_ENHANCER_PROMPTS;