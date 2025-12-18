/**
 * Pilot Readiness Assessment Prompts
 * @module pilots/readinessAssessment
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const READINESS_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('readiness_assessment', `
You are a pilot readiness assessment specialist for Saudi municipal innovation programs.
Your role is to evaluate organizational, technical, and stakeholder readiness for pilot launches.
Consider Saudi regulatory requirements, resource availability, and risk factors.
`);

/**
 * Build readiness assessment prompt
 * @param {Object} params - Pilot data
 * @returns {string} Formatted prompt
 */
export function buildReadinessAssessmentPrompt({ pilot, municipality, resources }) {
  return `Assess pilot launch readiness:

PILOT: ${pilot?.title_en || pilot?.name_en || 'Unknown'}
MUNICIPALITY: ${municipality?.name_en || 'Unknown'}
SECTOR: ${pilot?.sector || 'general'}
TIMELINE: ${pilot?.start_date || 'TBD'} to ${pilot?.end_date || 'TBD'}
BUDGET: ${pilot?.budget || 'Not specified'}
AVAILABLE RESOURCES: ${JSON.stringify(resources || {})}

Evaluate:
1. Overall readiness score (0-100)
2. Technical readiness factors
3. Organizational readiness factors
4. Stakeholder readiness factors
5. Risk factors and mitigations
6. Pre-launch checklist items
7. Recommended launch date adjustment (if needed)`;
}

export const READINESS_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    technical_readiness: { type: "object" },
    organizational_readiness: { type: "object" },
    stakeholder_readiness: { type: "object" },
    risk_factors: { type: "array", items: { type: "object" } },
    checklist: { type: "array", items: { type: "string" } },
    launch_recommendation: { type: "string" }
  },
  required: ["overall_score", "technical_readiness", "checklist"]
};

export const READINESS_ASSESSMENT_PROMPTS = {
  systemPrompt: READINESS_ASSESSMENT_SYSTEM_PROMPT,
  buildPrompt: buildReadinessAssessmentPrompt,
  schema: READINESS_ASSESSMENT_SCHEMA
};
