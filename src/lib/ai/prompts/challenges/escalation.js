/**
 * Challenge Escalation Engine Prompts
 * @module challenges/escalation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ESCALATION_SYSTEM_PROMPT = getSystemPrompt('escalation_engine', `
You are a challenge escalation specialist for Saudi municipal governance.
Your role is to determine when challenges require escalation and to which authority level.
Consider SLA timelines, impact severity, and Saudi governmental hierarchy.
`);

/**
 * Build escalation analysis prompt
 * @param {Object} params - Challenge and context data
 * @returns {string} Formatted prompt
 */
export function buildEscalationPrompt({ challenge, slaStatus, escalationHistory, stakeholders }) {
  return `Analyze escalation requirements for this challenge:

CHALLENGE: ${challenge?.title_en || challenge?.title || 'Unknown'}
CODE: ${challenge?.code || 'N/A'}
STATUS: ${challenge?.status || 'Unknown'}
PRIORITY: ${challenge?.priority || 'medium'}
DAYS OPEN: ${challenge?.days_open || 'Unknown'}

SLA STATUS:
- Due Date: ${slaStatus?.due_date || 'Not set'}
- Days Remaining: ${slaStatus?.days_remaining || 'Unknown'}
- Current Level: ${slaStatus?.current_level || 0}

ESCALATION HISTORY: ${JSON.stringify(escalationHistory || [])}
STAKEHOLDERS: ${JSON.stringify(stakeholders || [])}

Determine:
1. Escalation required (yes/no)
2. Recommended escalation level
3. Target authority/role
4. Urgency level
5. Escalation justification
6. Suggested actions for resolution`;
}

export const ESCALATION_SCHEMA = {
  type: "object",
  properties: {
    escalation_required: { type: "boolean" },
    recommended_level: { type: "number" },
    target_authority: { type: "string" },
    urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
    justification: { type: "string" },
    suggested_actions: { type: "array", items: { type: "string" } },
    notification_recipients: { type: "array", items: { type: "string" } }
  },
  required: ["escalation_required", "recommended_level", "justification"]
};

export const ESCALATION_PROMPTS = {
  systemPrompt: ESCALATION_SYSTEM_PROMPT,
  buildPrompt: buildEscalationPrompt,
  schema: ESCALATION_SCHEMA
};
