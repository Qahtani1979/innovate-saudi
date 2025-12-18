/**
 * Strategic Timeline Prompts
 * @module strategy/timeline
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TIMELINE_SYSTEM_PROMPT = getSystemPrompt('timeline', `
You are a project planning specialist for Saudi municipal strategic initiatives.
Your role is to create realistic implementation timelines with phases, milestones, and critical paths.
Consider Vision 2030 alignment and municipal fiscal year cycles.
`);

/**
 * Build timeline generation prompt
 * @param {Object} params - Strategic plan components
 * @returns {string} Formatted prompt
 */
export function buildTimelinePrompt({ objectives, actionPlans, startDate, endDate }) {
  return `Generate strategic implementation timeline in BOTH English and Arabic:

Objectives: ${objectives?.length || 0} objectives defined
Action Plans: ${actionPlans?.length || 0} action plans
Start Date: ${startDate || 'To be determined'}
End Date: ${endDate || 'To be determined'}

Create timeline with:
1. Implementation phases (with dates)
2. Key milestones for each phase
3. Critical path identification
4. Dependencies between phases
5. Risk buffer periods
6. Review checkpoints
7. Go/no-go decision points`;
}

export const TIMELINE_SCHEMA = {
  type: "object",
  properties: {
    phases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          phase_name_en: { type: "string" },
          phase_name_ar: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          duration_weeks: { type: "number" },
          objectives: { type: "array", items: { type: "string" } },
          deliverables: { type: "array", items: { type: "string" } }
        }
      }
    },
    milestones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          milestone_en: { type: "string" },
          milestone_ar: { type: "string" },
          date: { type: "string" },
          phase: { type: "string" },
          is_critical: { type: "boolean" }
        }
      }
    },
    critical_path: { type: "array", items: { type: "string" } },
    risk_periods: { type: "array", items: { type: "string" } },
    review_checkpoints: { type: "array", items: { type: "string" } }
  }
};

export const TIMELINE_PROMPTS = {
  systemPrompt: TIMELINE_SYSTEM_PROMPT,
  buildPrompt: buildTimelinePrompt,
  schema: TIMELINE_SCHEMA
};
