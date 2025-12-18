/**
 * Approval Analysis Prompts
 * Centralized prompts for approval center analysis
 * @module prompts/approval/approvalAnalysis
 */

export const APPROVAL_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    strengths: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' },
    conditions: { type: 'array', items: { type: 'string' } }
  }
};

export const CHALLENGE_APPROVAL_PROMPT_TEMPLATE = (challenge) => `
Analyze this challenge for approval in Saudi municipal context:
Title: ${challenge.title_en || 'Untitled'}
Description: ${challenge.description_en || 'No description'}
Priority: ${challenge.priority || 'Not set'}
Sector: ${challenge.sector || 'General'}

Analyze:
1. Alignment with Saudi Vision 2030
2. Risk factors
3. Approval recommendation (approve/reject/request changes)
4. Suggested conditions`;

export const PILOT_APPROVAL_PROMPT_TEMPLATE = (pilot) => `
Analyze this pilot for approval in Saudi municipal context:
Title: ${pilot.title_en || 'Untitled'}
Description: ${pilot.description_en || 'No description'}
Budget: ${pilot.budget || 0} ${pilot.budget_currency || 'SAR'}
Timeline: ${pilot.start_date || 'Not set'} - ${pilot.end_date || 'Not set'}

Analyze:
1. Alignment with Saudi Vision 2030
2. Risk factors
3. Approval recommendation (approve/reject/request changes)
4. Suggested conditions`;

export const PROGRAM_APPROVAL_PROMPT_TEMPLATE = (program) => `
Analyze this program for approval in Saudi municipal context:
Title: ${program.title_en || 'Untitled'}
Description: ${program.description_en || 'No description'}
Budget: ${program.budget || 0}

Analyze:
1. Alignment with Saudi Vision 2030
2. Risk factors
3. Approval recommendation (approve/reject/request changes)
4. Suggested conditions`;

export const RD_PROJECT_APPROVAL_PROMPT_TEMPLATE = (rdProject) => `
Analyze this R&D project for approval in Saudi municipal context:
Title: ${rdProject.title_en || 'Untitled'}
Description: ${rdProject.description_en || 'No description'}
Research Area: ${rdProject.research_area_en || 'Not specified'}

Analyze:
1. Alignment with Saudi Vision 2030
2. Risk factors
3. Approval recommendation (approve/reject/request changes)
4. Suggested conditions`;

export const MILESTONE_APPROVAL_PROMPT_TEMPLATE = (pilotTitle, milestone) => `
Analyze this pilot milestone for approval:
Pilot: ${pilotTitle}
Milestone: ${milestone.name || 'Untitled'}
Due Date: ${milestone.due_date || 'Not set'}
Status: ${milestone.status || 'unknown'}

Provide approval recommendation with reasoning.`;

export const APPROVAL_ANALYSIS_PROMPT = {
  system: `You are an expert approval analyst for Saudi municipal innovation projects.
Evaluate submissions against Vision 2030 goals, risk factors, and implementation readiness.
Provide clear, actionable recommendations.`,
  schema: APPROVAL_ANALYSIS_SCHEMA
};

export default {
  APPROVAL_ANALYSIS_SCHEMA,
  CHALLENGE_APPROVAL_PROMPT_TEMPLATE,
  PILOT_APPROVAL_PROMPT_TEMPLATE,
  PROGRAM_APPROVAL_PROMPT_TEMPLATE,
  RD_PROJECT_APPROVAL_PROMPT_TEMPLATE,
  MILESTONE_APPROVAL_PROMPT_TEMPLATE,
  APPROVAL_ANALYSIS_PROMPT
};
