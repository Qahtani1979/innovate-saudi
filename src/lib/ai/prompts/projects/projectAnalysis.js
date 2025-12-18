/**
 * Project Analysis AI Prompts
 * @module prompts/projects/projectAnalysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Project health assessment prompt
 */
export const PROJECT_HEALTH_PROMPT_TEMPLATE = (project) => `
Assess this project's health and progress:

Project: ${project.title_en || project.title}
Type: ${project.project_type || 'general'}
Status: ${project.status || 'in_progress'}
Budget: ${project.budget || 'Not specified'} SAR
Spent: ${project.spent_amount || 0} SAR
Timeline: ${project.start_date} to ${project.end_date}
Progress: ${project.progress_percentage || 0}%

Milestones:
${project.milestones?.map(m => `- ${m.title}: ${m.status}`).join('\n') || 'None defined'}

Risks:
${project.risks?.map(r => `- ${r.description}: ${r.severity}`).join('\n') || 'None identified'}

${SAUDI_CONTEXT}

Analyze:
1. Overall Health Score (0-100)
2. Schedule Performance Index
3. Cost Performance Index
4. Risk Assessment
5. Recommended Actions
`;

/**
 * Project roadmap generation prompt
 */
export const PROJECT_ROADMAP_PROMPT_TEMPLATE = (project, duration) => `
Generate a detailed roadmap for this project:

Project: ${project.title_en || project.title}
Duration: ${duration} months
Current Phase: ${project.current_phase || 'planning'}
Team Size: ${project.team_size || 'Not specified'}

Objectives:
${project.objectives?.map(o => `- ${o}`).join('\n') || 'Define project objectives'}

${SAUDI_CONTEXT}

Create roadmap with:
1. Phase breakdown
2. Key milestones per phase
3. Resource allocation recommendations
4. Risk mitigation checkpoints
5. Success metrics per phase
`;

export const PROJECT_ANALYSIS_SYSTEM_PROMPT = `You are a project management expert for Saudi Arabian government and municipal projects. Provide analysis aligned with PMO standards and Vision 2030 objectives.`;

export const PROJECT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    healthScore: { type: "number" },
    spiIndex: { type: "number" },
    cpiIndex: { type: "number" },
    riskLevel: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["healthScore", "recommendations"]
};
