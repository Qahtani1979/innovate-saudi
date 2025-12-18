/**
 * Risk Assessment Prompts
 * @module strategy/riskAssessment
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RISK_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('risk_assessment', `
You are a risk management specialist for Saudi municipal innovation projects.
Your role is to identify, assess, and recommend mitigation strategies for strategic risks.
Consider operational, financial, technical, and regulatory risk categories.
`);

/**
 * Build risk assessment prompt
 * @param {Object} params - Context for risk identification
 * @returns {string} Formatted prompt
 */
export function buildRiskAssessmentPrompt({ context, projectType, sector }) {
  return `Identify and assess risks in BOTH English and Arabic:

Context: ${context || 'Municipal innovation project'}
Project Type: ${projectType || 'Not specified'}
Sector: ${sector || 'General'}

For each identified risk provide:
1. Risk title (bilingual)
2. Risk description
3. Category (operational/financial/technical/regulatory/reputational)
4. Likelihood (1-5)
5. Impact (1-5)
6. Risk score (likelihood × impact)
7. Mitigation strategies
8. Contingency plans
9. Risk owner recommendation`;
}

export const RISK_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          title_ar: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          likelihood: { type: "number" },
          impact: { type: "number" },
          risk_score: { type: "number" },
          mitigation_strategies: { type: "array", items: { type: "string" } },
          contingency_plan: { type: "string" },
          risk_owner: { type: "string" }
        }
      }
    },
    summary: { type: "string" },
    overall_risk_level: { type: "string" }
  }
};

export const RISK_ASSESSMENT_PROMPTS = {
  systemPrompt: RISK_ASSESSMENT_SYSTEM_PROMPT,
  buildPrompt: buildRiskAssessmentPrompt,
  schema: RISK_ASSESSMENT_SCHEMA
};
