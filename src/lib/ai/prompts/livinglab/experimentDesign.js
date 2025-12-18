/**
 * Living Lab Experiment Design Prompts
 * @module livinglab/experimentDesign
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const EXPERIMENT_DESIGN_SYSTEM_PROMPT = getSystemPrompt('experiment_design', `
You are a living lab experiment design specialist for Saudi Arabia's municipal innovation platform.
Your role is to design rigorous experiments with clear hypotheses, metrics, and methodologies.
Consider ethical guidelines, citizen participation, and municipal context.
`);

export function buildExperimentDesignPrompt({ hypothesis, context, resources }) {
  return `Design a living lab experiment:

HYPOTHESIS: ${hypothesis}

CONTEXT:
- Municipality: ${context?.municipality || 'N/A'}
- Target Population: ${context?.population || 'N/A'}
- Duration: ${context?.duration || '3 months'}

AVAILABLE RESOURCES:
${resources?.map(r => `- ${r}`).join('\n') || 'Standard municipal resources'}

Design:
1. Experiment methodology
2. Control and treatment groups
3. Key metrics and KPIs
4. Data collection plan
5. Success criteria
6. Risk factors and mitigations`;
}

export const EXPERIMENT_DESIGN_SCHEMA = {
  type: "object",
  properties: {
    methodology: { type: "string" },
    control_group: {
      type: "object",
      properties: {
        description: { type: "string" },
        size: { type: "number" },
        selection_criteria: { type: "string" }
      }
    },
    treatment_group: {
      type: "object",
      properties: {
        description: { type: "string" },
        size: { type: "number" },
        intervention: { type: "string" }
      }
    },
    metrics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          measurement_method: { type: "string" },
          frequency: { type: "string" }
        }
      }
    },
    success_criteria: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    timeline_phases: { type: "array", items: { type: "string" } }
  },
  required: ["methodology", "metrics", "success_criteria"]
};

export const EXPERIMENT_DESIGN_PROMPTS = {
  systemPrompt: EXPERIMENT_DESIGN_SYSTEM_PROMPT,
  buildPrompt: buildExperimentDesignPrompt,
  schema: EXPERIMENT_DESIGN_SCHEMA
};
