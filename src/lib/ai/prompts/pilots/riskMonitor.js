/**
 * Pilot Risk Monitor Prompts
 * @module pilots/riskMonitor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RISK_MONITOR_SYSTEM_PROMPT = getSystemPrompt('risk_monitor', `
You are a pilot risk monitoring specialist for Saudi municipal innovation.
Your role is to continuously assess pilot risks and recommend mitigation strategies.
Consider operational, technical, stakeholder, and financial risk dimensions.
`);

/**
 * Build risk monitoring prompt
 * @param {Object} params - Pilot and metrics data
 * @returns {string} Formatted prompt
 */
export function buildRiskMonitorPrompt({ pilot, metrics, incidents, timeline }) {
  return `Assess current risks for this pilot:

PILOT: ${pilot?.title_en || pilot?.name_en || 'Unknown'}
STATUS: ${pilot?.status || 'active'}
DAYS ACTIVE: ${pilot?.days_active || 'Unknown'}
PROGRESS: ${pilot?.progress_percentage || 0}%

CURRENT METRICS:
${JSON.stringify(metrics || {})}

RECENT INCIDENTS: ${(incidents || []).length} reported
TIMELINE STATUS: ${timeline?.status || 'on_track'}

Assess:
1. Overall risk score (0-100)
2. Risk breakdown by category
3. Emerging risk indicators
4. Recommended mitigations
5. Escalation triggers
6. Risk trend (improving/stable/worsening)`;
}

export const RISK_MONITOR_SCHEMA = {
  type: "object",
  properties: {
    overall_risk_score: { type: "number" },
    risk_breakdown: {
      type: "object",
      properties: {
        operational: { type: "number" },
        technical: { type: "number" },
        stakeholder: { type: "number" },
        financial: { type: "number" },
        timeline: { type: "number" }
      }
    },
    emerging_risks: { type: "array", items: { type: "string" } },
    mitigations: { type: "array", items: { type: "object" } },
    escalation_triggers: { type: "array", items: { type: "string" } },
    risk_trend: { type: "string", enum: ["improving", "stable", "worsening"] }
  },
  required: ["overall_risk_score", "risk_breakdown", "mitigations", "risk_trend"]
};

export const RISK_MONITOR_PROMPTS = {
  systemPrompt: RISK_MONITOR_SYSTEM_PROMPT,
  buildPrompt: buildRiskMonitorPrompt,
  schema: RISK_MONITOR_SCHEMA
};
