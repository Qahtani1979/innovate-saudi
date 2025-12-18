/**
 * Living Lab Expert Matching Prompts
 * @module livinglab/expertMatching
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const EXPERT_MATCHING_SYSTEM_PROMPT = getSystemPrompt('expert_matching', `
You are an expert matching specialist for Saudi municipal living labs.
Your role is to match research experts and practitioners with lab experiments.
Consider expertise domains, availability, and past collaboration success.
`);

/**
 * Build expert matching prompt
 * @param {Object} params - Experiment and expert pool data
 * @returns {string} Formatted prompt
 */
export function buildExpertMatchingPrompt({ experiment, expertPool, requirements }) {
  return `Match experts for this living lab experiment:

Experiment: ${experiment?.title_en || 'Unknown'}
Domain: ${experiment?.domain || 'general'}
Duration: ${experiment?.duration_weeks || 'TBD'} weeks
Complexity: ${experiment?.complexity || 'medium'}

Requirements:
${requirements?.map(r => `- ${r}`).join('\n') || 'Not specified'}

Available Experts:
${expertPool?.slice(0, 10).map(e => 
  `${e.name}: ${e.expertise?.join(', ') || 'General'} - Available: ${e.availability || 'Unknown'}`
).join('\n') || 'No experts available'}

Recommend:
1. Top 3-5 expert matches with match scores
2. Required expertise not covered
3. Suggested collaboration structure
4. Potential conflicts or gaps`;
}

export const EXPERT_MATCHING_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          expert_name: { type: "string" },
          match_score: { type: "number" },
          expertise_match: { type: "array", items: { type: "string" } },
          role_suggestion: { type: "string" }
        }
      }
    },
    gaps: { type: "array", items: { type: "string" } },
    collaboration_structure: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } }
  }
};

export const EXPERT_MATCHING_PROMPTS = {
  systemPrompt: EXPERT_MATCHING_SYSTEM_PROMPT,
  buildPrompt: buildExpertMatchingPrompt,
  schema: EXPERT_MATCHING_SCHEMA
};
