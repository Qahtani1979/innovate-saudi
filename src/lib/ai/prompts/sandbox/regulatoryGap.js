/**
 * Regulatory Gap Analysis Prompts
 * @module sandbox/regulatoryGap
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const REGULATORY_GAP_SYSTEM_PROMPT = getSystemPrompt('regulatory_gap', `
You are a regulatory analysis specialist for Saudi municipal innovation sandboxes.
Your role is to identify regulatory gaps, compliance risks, and policy recommendations.
Consider Saudi regulations, municipal bylaws, and Vision 2030 regulatory modernization goals.
`);

/**
 * Build regulatory gap analysis prompt
 * @param {Object} params - Sandbox and regulatory data
 * @returns {string} Formatted prompt
 */
export function buildRegulatoryGapPrompt({ sandbox, solution, existingRegulations }) {
  return `Analyze regulatory gaps for this sandbox experiment:

SANDBOX: ${sandbox?.name_en || sandbox?.title || 'Unknown'}
SECTOR: ${sandbox?.sector || 'general'}
EXPERIMENT TYPE: ${sandbox?.experiment_type || 'pilot'}

SOLUTION: ${solution?.name_en || 'Not specified'}
TECHNOLOGY: ${solution?.technology_type || 'Not specified'}

EXISTING REGULATIONS: ${(existingRegulations || []).map(r => r.name).join(', ') || 'None identified'}

Identify:
1. Regulatory gaps (missing regulations)
2. Compliance risks
3. Required exemptions
4. Policy recommendations
5. Stakeholder approval needs
6. Timeline for regulatory clearance`;
}

export const REGULATORY_GAP_SCHEMA = {
  type: "object",
  properties: {
    regulatory_gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          gap_type: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    },
    compliance_risks: { type: "array", items: { type: "string" } },
    required_exemptions: { type: "array", items: { type: "string" } },
    policy_recommendations: { type: "array", items: { type: "string" } },
    approvals_needed: { type: "array", items: { type: "string" } },
    clearance_timeline: { type: "string" }
  },
  required: ["regulatory_gaps", "compliance_risks", "policy_recommendations"]
};

export const REGULATORY_GAP_PROMPTS = {
  systemPrompt: REGULATORY_GAP_SYSTEM_PROMPT,
  buildPrompt: buildRegulatoryGapPrompt,
  schema: REGULATORY_GAP_SCHEMA
};
