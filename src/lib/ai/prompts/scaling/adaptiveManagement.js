/**
 * Adaptive Management Prompts for Scaling
 * @module scaling/adaptiveManagement
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const ADAPTIVE_SCALING_SYSTEM_PROMPT = getSystemPrompt('adaptive_scaling', `
You are a scaling strategy specialist for Saudi Arabia's municipal innovation platform.
Your role is to recommend adaptive management strategies for scaling pilots and programs.
Consider regional variations, resource constraints, and Vision 2030 alignment.
`);

export function buildAdaptiveScalingPrompt({ entity, metrics, context }) {
  return `Analyze scaling performance and recommend adaptations:

ENTITY: ${entity.title_en || entity.name_en}
TYPE: ${entity.type || 'Pilot'}
CURRENT STAGE: ${entity.stage || 'scaling'}

METRICS:
${Object.entries(metrics || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

CONTEXT:
- Region: ${context?.region || 'N/A'}
- Budget: ${context?.budget || 'N/A'}
- Timeline: ${context?.timeline || 'N/A'}

Provide:
1. Performance assessment
2. Recommended adaptations
3. Risk mitigation strategies
4. Resource reallocation suggestions
5. Timeline adjustments`;
}

export const ADAPTIVE_SCALING_SCHEMA = {
  type: "object",
  properties: {
    performance_score: { type: "number" },
    assessment_summary: { type: "string" },
    adaptations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          current_state: { type: "string" },
          recommended_change: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    },
    risk_mitigations: { type: "array", items: { type: "string" } },
    resource_suggestions: { type: "array", items: { type: "string" } },
    timeline_adjustments: { type: "string" }
  },
  required: ["performance_score", "adaptations"]
};

export const ADAPTIVE_SCALING_PROMPTS = {
  systemPrompt: ADAPTIVE_SCALING_SYSTEM_PROMPT,
  buildPrompt: buildAdaptiveScalingPrompt,
  schema: ADAPTIVE_SCALING_SCHEMA
};
