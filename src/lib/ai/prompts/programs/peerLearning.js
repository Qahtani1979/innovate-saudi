/**
 * Peer Learning Network Prompts
 * @module programs/peerLearning
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PEER_LEARNING_SYSTEM_PROMPT = getSystemPrompt('peer_learning', `
You are a cohort optimization specialist for Saudi municipal innovation programs.
Your role is to form optimal learning pods that maximize peer learning outcomes.
Consider skill complementarity, geographic diversity, and learning goals.
`);

/**
 * Build peer learning pod formation prompt
 * @param {Object} params - Cohort participants
 * @returns {string} Formatted prompt
 */
export function buildPeerLearningPrompt({ participants }) {
  const participantSummary = participants?.slice(0, 15).map(p => 
    `${p.name || p.full_name_en}: ${p.expertise || p.role || 'Participant'}`
  ).join('\n') || 'No participants provided';

  return `Form optimal learning pods for this program cohort:

Participants:
${participantSummary}

Create balanced pods with:
1. 3-5 members per pod
2. Diverse skill sets
3. Complementary expertise
4. Clear pod objectives
5. Suggested meeting cadence`;
}

export const PEER_LEARNING_SCHEMA = {
  type: "object",
  properties: {
    pods: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pod_name: { type: "string" },
          members: { type: "array", items: { type: "string" } },
          focus_area: { type: "string" },
          objectives: { type: "array", items: { type: "string" } },
          meeting_frequency: { type: "string" }
        }
      }
    },
    rationale: { type: "string" },
    success_metrics: { type: "array", items: { type: "string" } }
  }
};

export const PEER_LEARNING_PROMPTS = {
  systemPrompt: PEER_LEARNING_SYSTEM_PROMPT,
  buildPrompt: buildPeerLearningPrompt,
  schema: PEER_LEARNING_SCHEMA
};
