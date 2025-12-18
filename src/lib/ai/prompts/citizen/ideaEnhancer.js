/**
 * Citizen Idea Enhancer Prompts
 * @module citizen/ideaEnhancer
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IDEA_ENHANCER_SYSTEM_PROMPT = getSystemPrompt('idea_enhancer', `
You are a citizen innovation coach for Saudi municipal innovation.
Your role is to help citizens refine and strengthen their ideas.
Provide constructive suggestions while preserving the original vision.
`);

/**
 * Build idea enhancement prompt
 * @param {Object} params - Citizen idea data
 * @returns {string} Formatted prompt
 */
export function buildIdeaEnhancerPrompt({ idea, municipality, sector }) {
  return `Enhance citizen innovation idea:

Original Idea: ${idea?.title || 'Unknown'}
Description: ${idea?.description || 'Not provided'}
Category: ${idea?.category || sector || 'General'}
Municipality: ${municipality?.name_en || 'Unknown'}

Enhance:
1. Refined problem statement
2. Clearer value proposition
3. Implementation suggestions
4. Potential partnerships
5. Success metrics
6. Improved bilingual title and description`;
}

export const IDEA_ENHANCER_SCHEMA = {
  type: "object",
  properties: {
    enhanced_title_en: { type: "string" },
    enhanced_title_ar: { type: "string" },
    enhanced_description_en: { type: "string" },
    enhanced_description_ar: { type: "string" },
    problem_statement: { type: "string" },
    value_proposition: { type: "string" },
    implementation_suggestions: { type: "array", items: { type: "string" } },
    potential_partners: { type: "array", items: { type: "string" } },
    success_metrics: { type: "array", items: { type: "string" } }
  }
};

export const IDEA_ENHANCER_PROMPTS = {
  systemPrompt: IDEA_ENHANCER_SYSTEM_PROMPT,
  buildPrompt: buildIdeaEnhancerPrompt,
  schema: IDEA_ENHANCER_SCHEMA
};
