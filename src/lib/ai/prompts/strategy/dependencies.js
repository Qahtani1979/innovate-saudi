/**
 * Strategic Dependencies Prompts
 * @module strategy/dependencies
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DEPENDENCIES_SYSTEM_PROMPT = getSystemPrompt('dependencies', `
You are a strategic planning specialist for Saudi municipal innovation.
Your role is to identify dependencies, constraints, and assumptions for strategic initiatives.
Consider internal and external dependencies, resource constraints, and critical success factors.
`);

/**
 * Build dependencies analysis prompt
 * @param {Object} params - Strategic plan context
 * @returns {string} Formatted prompt
 */
export function buildDependenciesPrompt({ objectives, actionPlans, organizationContext }) {
  return `Analyze strategic dependencies in BOTH English and Arabic:

Objectives: ${objectives?.map(o => o.title_en).join(', ') || 'Not specified'}
Action Plans: ${actionPlans?.map(a => a.title_en).join(', ') || 'Not specified'}
Organization: ${organizationContext || 'Municipal entity'}

Identify:
1. Internal dependencies (between objectives/action plans)
2. External dependencies (partners, vendors, government)
3. Resource dependencies (budget, staff, technology)
4. Timeline dependencies (sequential requirements)
5. Constraints and limitations
6. Key assumptions
7. Critical success factors`;
}

export const DEPENDENCIES_SCHEMA = {
  type: "object",
  properties: {
    internal_dependencies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          type: { type: "string" },
          description_en: { type: "string" },
          description_ar: { type: "string" }
        }
      }
    },
    external_dependencies: { type: "array", items: { type: "string" } },
    resource_dependencies: { type: "array", items: { type: "string" } },
    constraints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          constraint_en: { type: "string" },
          constraint_ar: { type: "string" },
          impact: { type: "string" }
        }
      }
    },
    assumptions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          assumption_en: { type: "string" },
          assumption_ar: { type: "string" },
          risk_if_invalid: { type: "string" }
        }
      }
    },
    critical_success_factors: { type: "array", items: { type: "string" } }
  }
};

export const DEPENDENCIES_PROMPTS = {
  systemPrompt: DEPENDENCIES_SYSTEM_PROMPT,
  buildPrompt: buildDependenciesPrompt,
  schema: DEPENDENCIES_SCHEMA
};
