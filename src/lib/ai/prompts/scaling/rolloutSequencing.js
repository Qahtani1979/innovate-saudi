/**
 * Adaptive Rollout Sequencing Prompts
 * @module scaling/rolloutSequencing
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ROLLOUT_SEQUENCING_SYSTEM_PROMPT = getSystemPrompt('rollout_sequencing', `
You are a rollout optimization specialist for Saudi municipal innovation scaling.
Your role is to adapt rollout sequences based on real-time performance data.
Consider adoption rates, issue counts, and regional capacity when optimizing.
`);

/**
 * Build rollout sequencing prompt
 * @param {Object} params - Scaling plan and municipality data
 * @returns {string} Formatted prompt
 */
export function buildRolloutSequencingPrompt({ scalingPlan, municipalities }) {
  return `Optimize rollout sequence based on real-time performance:

Current Plan: ${scalingPlan?.phases?.map(p => p.municipalities?.join(', ')).join(' → ') || 'Not defined'}

Municipality Performance:
${municipalities?.map(m => 
  `${m.name_en}: Adoption ${m.adoption_rate || 0}%, Issues: ${m.issue_count || 0}`
).join('\n') || 'No data available'}

Recommend:
1. Should we accelerate any phase?
2. Should we delay/support any municipality?
3. Optimal next sequence
4. Specific interventions needed`;
}

export const ROLLOUT_SEQUENCING_SCHEMA = {
  type: "object",
  properties: {
    accelerate: { type: "array", items: { type: "string" } },
    delay_support: { type: "array", items: { type: "string" } },
    next_sequence: { type: "array", items: { type: "string" } },
    interventions: { type: "array", items: { type: "string" } }
  }
};

export const ROLLOUT_SEQUENCING_PROMPTS = {
  systemPrompt: ROLLOUT_SEQUENCING_SYSTEM_PROMPT,
  buildPrompt: buildRolloutSequencingPrompt,
  schema: ROLLOUT_SEQUENCING_SCHEMA
};
