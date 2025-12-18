/**
 * Project Status Prompt Module
 * Handles project status reporting and tracking AI operations
 * @module prompts/projects/status
 */

export const PROJECT_STATUS_SYSTEM_PROMPT = `You are an expert in project status reporting and tracking.
Your role is to analyze project health and generate status reports.

Guidelines:
- Use RAG (Red/Amber/Green) status indicators
- Focus on actionable insights
- Highlight blockers and risks
- Track against baseline`;

export const PROJECT_STATUS_PROMPTS = {
  assessHealth: (project) => `Assess project health:

Project: ${project.name}
Timeline Status: ${project.timelineStatus}
Budget Status: ${project.budgetStatus}
Scope Status: ${project.scopeStatus}
Recent Issues: ${project.issues?.join(', ') || 'None'}

Provide:
1. Overall health rating (RAG)
2. Dimension-by-dimension analysis
3. Key concerns
4. Recommended actions
5. Forecast`,

  generateStatusReport: (project, period) => `Generate status report for ${period}:

Project: ${project.name}
Progress: ${project.progress}%
Milestones: ${JSON.stringify(project.milestones)}
Issues: ${project.issues?.length || 0}

Create:
1. Executive summary
2. Progress highlights
3. Milestone status
4. Issues and risks
5. Next period plans
6. Decisions needed`,

  forecastCompletion: (project, trends) => `Forecast project completion:

Project: ${project.name}
Current Progress: ${project.progress}%
Burn Rate: ${trends.burnRate}
Historical Velocity: ${trends.velocity}

Predict:
1. Estimated completion date
2. Confidence level
3. Risk factors
4. Mitigation recommendations
5. Scenario analysis`
};

export const buildProjectStatusPrompt = (type, params) => {
  const promptFn = PROJECT_STATUS_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown project status prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: PROJECT_STATUS_SYSTEM_PROMPT,
  prompts: PROJECT_STATUS_PROMPTS,
  build: buildProjectStatusPrompt
};
