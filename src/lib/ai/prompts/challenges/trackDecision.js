/**
 * Challenge Track Assignment Decision Prompts
 * @module challenges/trackDecision
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TRACK_DECISION_SYSTEM_PROMPT = getSystemPrompt('track_decision', `
You are a challenge treatment strategist for Saudi Arabia's municipal innovation platform.
Your role is to recommend the most appropriate treatment tracks for municipal challenges.
Consider challenge characteristics, resources, and strategic alignment when making recommendations.
`);

/**
 * Build track assignment decision prompt
 * @param {Object} params - Challenge data
 * @returns {string} Formatted prompt
 */
export function buildTrackDecisionPrompt({ challenge }) {
  return `Analyze this municipal challenge and recommend treatment tracks:

Challenge: ${challenge?.title_en || 'Unknown'}
Description: ${challenge?.description_en || 'N/A'}
Sector: ${challenge?.sector || 'N/A'}
Problem Statement: ${challenge?.problem_statement_en || 'N/A'}
Root Cause: ${challenge?.root_cause_en || 'N/A'}
Budget Estimate: ${challenge?.budget_estimate || 'N/A'}
Timeline: ${challenge?.timeline_estimate || 'N/A'}

Available tracks: pilot, r_and_d, program, procurement, policy

Recommend which track(s) are most appropriate and provide brief rationale for each.`;
}

export const TRACK_DECISION_SCHEMA = {
  type: 'object',
  properties: {
    recommended_tracks: { 
      type: 'array', 
      items: { 
        type: 'string',
        enum: ['pilot', 'r_and_d', 'program', 'procurement', 'policy']
      } 
    },
    rationale: { type: 'string' },
    track_justifications: {
      type: 'object',
      properties: {
        pilot: { type: 'string' },
        r_and_d: { type: 'string' },
        program: { type: 'string' },
        procurement: { type: 'string' },
        policy: { type: 'string' }
      }
    }
  },
  required: ['recommended_tracks', 'rationale']
};

export const TRACK_DECISION_PROMPTS = {
  systemPrompt: TRACK_DECISION_SYSTEM_PROMPT,
  buildPrompt: buildTrackDecisionPrompt,
  schema: TRACK_DECISION_SCHEMA
};
