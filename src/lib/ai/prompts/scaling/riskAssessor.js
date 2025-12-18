/**
 * Scaling Risk Assessor Prompts
 * @module scaling/riskAssessor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SCALING_RISK_SYSTEM_PROMPT = getSystemPrompt('scaling_risk', `
You are a scaling risk analyst for Saudi municipal innovation.
Your role is to identify and assess risks during solution scaling across municipalities.
Consider technical, organizational, cultural, and resource risks.
`);

/**
 * Build scaling risk assessment prompt
 * @param {Object} params - Scaling context data
 * @returns {string} Formatted prompt
 */
export function buildScalingRiskPrompt({ solution, targetMunicipalities, currentPhase }) {
  return `Assess scaling risks for this expansion:

Solution: ${solution?.name_en || 'Unknown'}
Current TRL: ${solution?.trl_level || 'N/A'}
Sector: ${solution?.sector || 'general'}

Target Municipalities:
${targetMunicipalities?.map(m => `${m.name_en}: Population ${m.population || 'N/A'}`).join('\n') || 'Not specified'}

Current Phase: ${currentPhase || 'Planning'}

Identify:
1. Technical risks (infrastructure, integration)
2. Organizational risks (capacity, change management)
3. Cultural/adoption risks
4. Resource risks (budget, staffing)
5. Mitigation strategies for each risk`;
}

export const SCALING_RISK_SCHEMA = {
  type: "object",
  properties: {
    technical_risks: { 
      type: "array", 
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          severity: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    },
    organizational_risks: { type: "array", items: { type: "string" } },
    adoption_risks: { type: "array", items: { type: "string" } },
    resource_risks: { type: "array", items: { type: "string" } },
    overall_risk_score: { type: "number" },
    recommendations: { type: "array", items: { type: "string" } }
  }
};

export const SCALING_RISK_PROMPTS = {
  systemPrompt: SCALING_RISK_SYSTEM_PROMPT,
  buildPrompt: buildScalingRiskPrompt,
  schema: SCALING_RISK_SCHEMA
};
