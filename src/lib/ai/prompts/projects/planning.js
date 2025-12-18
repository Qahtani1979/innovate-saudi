/**
 * Project Planning Prompt Module
 * Handles project planning and management AI operations
 * @module prompts/projects/planning
 */

export const PROJECT_PLANNING_SYSTEM_PROMPT = `You are an expert in government project planning and management.
Your role is to assist in project planning, scheduling, and resource allocation.

Guidelines:
- Follow PMO standards
- Consider government procurement cycles
- Account for stakeholder coordination
- Ensure risk management`;

export const PROJECT_PLANNING_PROMPTS = {
  createProjectPlan: (project) => `Create project plan:

Project: ${project.name}
Objectives: ${project.objectives?.join(', ')}
Duration: ${project.duration || '12 months'}
Budget: ${project.budget || 'TBD'}

Generate:
1. Work breakdown structure
2. Phase definitions
3. Key milestones
4. Resource requirements
5. Risk register
6. Communication plan`,

  estimateTimeline: (scope, resources) => `Estimate project timeline:

Scope: ${JSON.stringify(scope)}
Available Resources: ${JSON.stringify(resources)}
Constraints: ${scope.constraints?.join(', ') || 'None specified'}

Provide:
1. Phase durations
2. Critical path
3. Dependencies
4. Buffer recommendations
5. Acceleration options`,

  allocateResources: (project, pool) => `Allocate resources to project:

Project Requirements: ${JSON.stringify(project.requirements)}
Resource Pool: ${JSON.stringify(pool)}
Priority: ${project.priority || 'Medium'}

Recommend:
1. Team composition
2. Role assignments
3. Utilization rates
4. Skill gap coverage
5. Backup resources`
};

export const buildProjectPlanningPrompt = (type, params) => {
  const promptFn = PROJECT_PLANNING_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown project planning prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: PROJECT_PLANNING_SYSTEM_PROMPT,
  prompts: PROJECT_PLANNING_PROMPTS,
  build: buildProjectPlanningPrompt
};
