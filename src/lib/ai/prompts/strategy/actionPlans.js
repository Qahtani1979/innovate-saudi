/**
 * Action Plans Prompts
 * @module strategy/actionPlans
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ACTION_PLANS_SYSTEM_PROMPT = getSystemPrompt('action_plans', `
You are a strategic execution specialist for Saudi municipal innovation.
Your role is to create detailed action plans with measurable outcomes and clear accountability.
Focus on practical implementation aligned with Vision 2030 principles.
`);

/**
 * Build action plans generation prompt
 * @param {Object} params - Objectives context
 * @returns {string} Formatted prompt
 */
export function buildActionPlansPrompt({ objectives, budget, timeframe }) {
  return `Generate strategic action plans in BOTH English and Arabic:

Objectives:
${objectives?.map((o, i) => `${i + 1}. ${o.title_en}`).join('\n') || 'Not specified'}

Budget: ${budget || 'To be determined'}
Timeframe: ${timeframe || 'Annual'}

For each objective create action plans with:
1. Action title (bilingual)
2. Description and scope
3. Key activities and tasks
4. Resource requirements (budget, staff)
5. Timeline with milestones
6. Success metrics and KPIs
7. Responsible owner
8. Dependencies and prerequisites`;
}

export const ACTION_PLANS_SCHEMA = {
  type: "object",
  properties: {
    action_plans: {
      type: "array",
      items: {
        type: "object",
        properties: {
          objective_id: { type: "string" },
          title_en: { type: "string" },
          title_ar: { type: "string" },
          description: { type: "string" },
          activities: { type: "array", items: { type: "string" } },
          budget_estimate: { type: "number" },
          duration_months: { type: "number" },
          milestones: { type: "array", items: { type: "string" } },
          kpis: { type: "array", items: { type: "string" } },
          owner_role: { type: "string" },
          dependencies: { type: "array", items: { type: "string" } }
        }
      }
    },
    total_budget: { type: "number" },
    implementation_notes: { type: "string" }
  }
};

export const ACTION_PLANS_PROMPTS = {
  systemPrompt: ACTION_PLANS_SYSTEM_PROMPT,
  buildPrompt: buildActionPlansPrompt,
  schema: ACTION_PLANS_SCHEMA
};
