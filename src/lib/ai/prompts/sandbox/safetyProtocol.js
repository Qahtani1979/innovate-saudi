/**
 * Safety Protocol Prompts
 * AI-powered safety protocol generation for sandbox projects
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for safety protocol generation
 */
export const SAFETY_PROTOCOL_SYSTEM_PROMPT = getSystemPrompt('safety_protocol', `
You are an expert safety protocol developer for Saudi municipal innovation sandboxes.

PROTOCOL GUIDELINES:
1. Follow Saudi safety regulations
2. Include comprehensive emergency procedures
3. Define clear monitoring requirements
4. Specify training needs
5. Establish review schedules
`);

/**
 * Build safety protocol prompt
 * @param {Object} params - Protocol parameters
 * @returns {string} Formatted prompt
 */
export function buildSafetyProtocolPrompt({ projectData, sandbox }) {
  return `Generate comprehensive safety protocols for this sandbox project:

Project: ${projectData.project_title}
Description: ${projectData.project_description}
Domain: ${sandbox.domain}
Duration: ${projectData.duration_months} months
Location: ${sandbox.name_en}
Requested Exemptions: ${JSON.stringify(projectData.requested_exemptions)}

Create detailed safety protocols including:
1. Public safety measures
2. Emergency response procedures
3. Monitoring and reporting requirements
4. Risk mitigation strategies
5. Incident response protocols
6. Communication plan
7. Evacuation procedures (if applicable)
8. Equipment safety standards
9. Personnel training requirements
10. Periodic review schedule

Format as structured document with sections.`;
}

/**
 * Response schema for safety protocol
 */
export const SAFETY_PROTOCOL_SCHEMA = {
  type: "object",
  properties: {
    public_safety_measures: {
      type: "array",
      items: { type: "string" }
    },
    emergency_response: {
      type: "array",
      items: { type: "string" }
    },
    monitoring_requirements: {
      type: "array",
      items: { type: "string" }
    },
    risk_mitigation: {
      type: "array",
      items: { type: "string" }
    },
    incident_response: {
      type: "array",
      items: { type: "string" }
    },
    communication_plan: { type: "string" },
    equipment_standards: {
      type: "array",
      items: { type: "string" }
    },
    personnel_training: {
      type: "array",
      items: { type: "string" }
    },
    review_schedule: { type: "string" },
    full_document: { type: "string", description: "Complete formatted document" }
  }
};
