/**
 * Advanced Resource Optimizer Prompts
 * @module bonus/resourceOptimizer
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RESOURCE_OPTIMIZER_SYSTEM_PROMPT = getSystemPrompt('resource_optimizer', `
You are a resource optimization specialist for Saudi municipal innovation platform.
Your role is to maximize ROI through intelligent resource allocation across programs.
Consider budget constraints, human resources, and facility availability.
`);

/**
 * Build resource optimization prompt
 * @param {Object} params - Resource allocation context
 * @returns {string} Formatted prompt
 */
export function buildResourceOptimizerPrompt({ resources, currentAllocation }) {
  return `Optimize resource allocation across platform:

Resources:
${resources?.budget ? `- Budget: ${resources.budget} SAR` : '- Budget: 50M SAR'}
${resources?.mentors ? `- Expert mentors: ${resources.mentors} available` : '- Expert mentors: 15 available'}
${resources?.labSlots ? `- Living lab slots: ${resources.labSlots} per quarter` : '- Living lab slots: 20 per quarter'}
${resources?.sandboxZones ? `- Sandbox zones: ${resources.sandboxZones} active` : '- Sandbox zones: 3 active'}

Current allocation:
${currentAllocation?.pilots ? `- Pilots: ${currentAllocation.pilots.budget}, ${currentAllocation.pilots.mentors} mentors, ${currentAllocation.pilots.labSlots} lab slots` : '- Pilots: 30M, 8 mentors, 12 lab slots'}
${currentAllocation?.rd ? `- R&D: ${currentAllocation.rd.budget}, ${currentAllocation.rd.mentors} mentors, ${currentAllocation.rd.labSlots} lab slots` : '- R&D: 15M, 5 mentors, 8 lab slots'}
${currentAllocation?.programs ? `- Programs: ${currentAllocation.programs.budget}, ${currentAllocation.programs.mentors} mentors, ${currentAllocation.programs.labSlots} lab slots` : '- Programs: 5M, 2 mentors, 0 lab slots'}

Recommend reallocation for maximum ROI and suggest conflicts to resolve.`;
}

export const RESOURCE_OPTIMIZER_SCHEMA = {
  type: "object",
  properties: {
    reallocations: { type: "array", items: { type: "string" } },
    expected_roi_gain: { type: "string" },
    conflicts: { type: "array", items: { type: "string" } }
  }
};

export const RESOURCE_OPTIMIZER_PROMPTS = {
  systemPrompt: RESOURCE_OPTIMIZER_SYSTEM_PROMPT,
  buildPrompt: buildResourceOptimizerPrompt,
  schema: RESOURCE_OPTIMIZER_SCHEMA
};
