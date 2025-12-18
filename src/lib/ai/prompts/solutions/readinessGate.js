/**
 * Solution Readiness Gate Prompts
 * @module solutions/readinessGate
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const READINESS_GATE_SYSTEM_PROMPT = getSystemPrompt('readiness_gate', `
You are a solution readiness assessment specialist for Saudi Arabia's municipal innovation platform.
Your role is to evaluate if solutions meet minimum criteria for municipal piloting.
Check technical maturity, documentation, compliance, and support infrastructure.
Provide clear pass/fail assessments with actionable blockers and warnings.
`);

/**
 * Build solution readiness assessment prompt
 * @param {Object} params - Solution details
 * @returns {string} Formatted prompt
 */
export function buildReadinessGatePrompt({ solution }) {
  return `Assess if this solution is ready for municipal piloting:

SOLUTION: ${solution.name_en}
PROVIDER: ${solution.provider_name || 'Unknown'}
MATURITY: ${solution.maturity_level || 'N/A'}
TRL: ${solution.trl || 'N/A'}
VERIFIED: ${solution.is_verified || false}
DEPLOYMENTS: ${solution.deployment_count || 0}
CERTIFICATIONS: ${solution.certifications?.length || 0}
DOCUMENTATION: ${solution.documentation_url ? 'Yes' : 'No'}
PRICING: ${solution.pricing_model || 'N/A'}

Check against pilot readiness criteria:
1. Technical maturity (TRL ≥ 6 for pilots)
2. Provider verification status
3. Documentation completeness
4. Pricing clarity
5. Support infrastructure
6. Compliance certifications

Return: ready (boolean), score (0-100), blockers (critical issues), warnings (minor issues)`;
}

export const READINESS_GATE_SCHEMA = {
  type: "object",
  properties: {
    ready: { type: "boolean" },
    score: { type: "number", minimum: 0, maximum: 100 },
    blockers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          severity: { type: "string", enum: ["critical", "high", "medium"] },
          resolution: { type: "string" }
        },
        required: ["issue", "severity", "resolution"]
      }
    },
    warnings: { type: "array", items: { type: "string" } },
    passed_checks: { type: "array", items: { type: "string" } }
  },
  required: ["ready", "score"]
};

export const READINESS_GATE_PROMPTS = {
  systemPrompt: READINESS_GATE_SYSTEM_PROMPT,
  buildPrompt: buildReadinessGatePrompt,
  schema: READINESS_GATE_SCHEMA
};
