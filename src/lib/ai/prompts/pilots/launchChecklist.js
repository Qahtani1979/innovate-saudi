/**
 * Pilot Launch Checklist Prompts
 * AI-powered pre-launch readiness checklist generation
 * @module prompts/pilots/launchChecklist
 */

/**
 * Pilot launch checklist prompt template
 * @param {Object} pilot - Pilot data
 * @returns {string} Formatted prompt
 */
export const PILOT_LAUNCH_CHECKLIST_PROMPT_TEMPLATE = (pilot) => `
Generate pre-launch readiness checklist for this pilot:
Title: ${pilot.title_en || pilot.title || 'Unnamed Pilot'}
Sector: ${pilot.sector || 'N/A'}
Budget: ${pilot.budget || 'N/A'}
Team size: ${pilot.team?.length || 0}
Technology: ${pilot.technology_stack?.map(t => t.technology).join(', ') || 'N/A'}

Generate 8-12 specific, actionable checklist items covering:
- Team readiness
- Stakeholder alignment
- Equipment/technology setup
- Data collection systems
- Safety & compliance
- Communication plan
- Budget confirmation

Return as JSON object with boolean flags for each item.
`;

/**
 * Response schema for pilot launch checklist
 */
export const PILOT_LAUNCH_CHECKLIST_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    checklist_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          category: { type: "string" }
        }
      }
    }
  }
};

/**
 * System prompt for pilot launch checklist
 */
export const PILOT_LAUNCH_CHECKLIST_SYSTEM_PROMPT = `You are an expert in pilot program management and municipal innovation projects. Generate comprehensive, actionable pre-launch checklists that ensure pilot readiness and minimize risks.`;

export default {
  PILOT_LAUNCH_CHECKLIST_PROMPT_TEMPLATE,
  PILOT_LAUNCH_CHECKLIST_RESPONSE_SCHEMA,
  PILOT_LAUNCH_CHECKLIST_SYSTEM_PROMPT
};
