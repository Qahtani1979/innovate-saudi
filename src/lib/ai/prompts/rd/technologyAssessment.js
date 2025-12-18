/**
 * R&D Technology Assessment Prompts
 * @module rd/technologyAssessment
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TECHNOLOGY_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('technology_assessment', `
You are a technology assessment specialist for Saudi municipal R&D projects.
Your role is to evaluate technology readiness, implementation feasibility, and innovation potential.
Consider Saudi infrastructure, regulatory environment, and Vision 2030 digital transformation goals.
`);

/**
 * Build technology assessment prompt
 * @param {Object} params - R&D project data
 * @returns {string} Formatted prompt
 */
export function buildTechnologyAssessmentPrompt({ project, technologies, requirements }) {
  return `Assess technology for R&D implementation:

PROJECT: ${project?.title_en || project?.name_en || 'Unknown'}
TECHNOLOGIES: ${(technologies || []).join(', ') || 'Not specified'}
SECTOR: ${project?.sector || 'general'}
REQUIREMENTS: ${JSON.stringify(requirements || {})}

Evaluate:
1. Technology Readiness Level (TRL 1-9)
2. Implementation complexity (low/medium/high)
3. Infrastructure requirements
4. Integration challenges
5. Risk assessment
6. Recommended technology stack
7. Implementation timeline estimate`;
}

export const TECHNOLOGY_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    trl_level: { type: "number" },
    implementation_complexity: { type: "string" },
    infrastructure_requirements: { type: "array", items: { type: "string" } },
    integration_challenges: { type: "array", items: { type: "string" } },
    risk_assessment: { type: "object" },
    recommended_stack: { type: "array", items: { type: "string" } },
    timeline_estimate: { type: "string" }
  },
  required: ["trl_level", "implementation_complexity", "recommended_stack"]
};

export const TECHNOLOGY_ASSESSMENT_PROMPTS = {
  systemPrompt: TECHNOLOGY_ASSESSMENT_SYSTEM_PROMPT,
  buildPrompt: buildTechnologyAssessmentPrompt,
  schema: TECHNOLOGY_ASSESSMENT_SCHEMA
};
