/**
 * Innovation Assessment Prompt Module
 * Handles innovation evaluation and scoring AI operations
 * @module prompts/innovation/assessment
 */

export const INNOVATION_ASSESSMENT_SYSTEM_PROMPT = `You are an expert in innovation assessment for government initiatives.
Your role is to evaluate innovation potential and readiness across projects.

Guidelines:
- Use established innovation frameworks
- Consider Saudi context and Vision 2030
- Balance risk with potential impact
- Support evidence-based decisions`;

export const INNOVATION_ASSESSMENT_PROMPTS = {
  evaluateInnovation: (project) => `Evaluate innovation potential:

Project: ${project.name}
Description: ${project.description}
Sector: ${project.sector || 'General'}
Current TRL: ${project.trl || 'Unknown'}

Assess:
1. Novelty score (1-10)
2. Impact potential
3. Feasibility assessment
4. Market readiness
5. Scalability potential
6. Overall innovation score`,

  assessReadiness: (initiative, criteria) => `Assess innovation readiness:

Initiative: ${initiative.name}
Stage: ${initiative.stage}
Criteria: ${criteria.join(', ')}

Evaluate:
1. Technical readiness
2. Organizational readiness
3. Market readiness
4. Resource readiness
5. Gap analysis
6. Recommendations`,

  benchmarkInnovation: (project, comparables) => `Benchmark innovation against peers:

Project: ${project.name}
Comparables: ${comparables.map(c => c.name).join(', ')}

Compare:
1. Innovation metrics
2. Unique differentiators
3. Competitive position
4. Best practices to adopt
5. Areas for improvement`
};

export const buildInnovationAssessmentPrompt = (type, params) => {
  const promptFn = INNOVATION_ASSESSMENT_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown innovation assessment prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: INNOVATION_ASSESSMENT_SYSTEM_PROMPT,
  prompts: INNOVATION_ASSESSMENT_PROMPTS,
  build: buildInnovationAssessmentPrompt
};
