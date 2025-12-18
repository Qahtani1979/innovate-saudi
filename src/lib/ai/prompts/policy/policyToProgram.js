/**
 * Policy to Program Converter Prompts
 * @module policy/policyToProgram
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const POLICY_TO_PROGRAM_SYSTEM_PROMPT = getSystemPrompt('policy_to_program', `
You are a policy implementation specialist for Saudi Arabia's municipal innovation platform.
Your role is to design training programs that help stakeholders implement new policies.
Focus on practical implementation, change management, and stakeholder readiness.
Create bilingual content aligned with Vision 2030 goals.
`);

/**
 * Build policy to program conversion prompt
 * @param {Object} params - Policy details
 * @returns {string} Formatted prompt
 */
export function buildPolicyToProgramPrompt({ policy }) {
  return `Design a training program to implement this policy.

POLICY:
Title: ${policy.title_en}
Recommendation: ${policy.recommendation_text_en}
Implementation Steps: ${JSON.stringify(policy.implementation_steps || [])}
Affected Stakeholders: ${policy.affected_stakeholders?.join(', ')}

Generate implementation training program:
- Program name (bilingual) - "Implementation of [Policy]"
- Objectives (what stakeholders will learn)
- Training curriculum (4-6 modules covering policy understanding, change management, practical implementation)
- Target participants (stakeholder groups)
- Timeline and rollout plan

Focus on practical implementation and stakeholder readiness.`;
}

export const POLICY_TO_PROGRAM_SCHEMA = {
  type: "object",
  properties: {
    name_en: { type: "string" },
    name_ar: { type: "string" },
    objectives_en: { type: "string" },
    objectives_ar: { type: "string" },
    curriculum: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "number" },
          topic_en: { type: "string" },
          topic_ar: { type: "string" },
          activities: { type: "array", items: { type: "string" } }
        },
        required: ["week", "topic_en"]
      }
    },
    target_participants: {
      type: "object",
      properties: {
        stakeholder_groups: { type: "array", items: { type: "string" } }
      }
    }
  },
  required: ["name_en", "objectives_en", "curriculum"]
};

export const POLICY_TO_PROGRAM_PROMPTS = {
  systemPrompt: POLICY_TO_PROGRAM_SYSTEM_PROMPT,
  buildPrompt: buildPolicyToProgramPrompt,
  schema: POLICY_TO_PROGRAM_SCHEMA
};
