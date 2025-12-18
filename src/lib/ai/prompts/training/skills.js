/**
 * Skills Assessment Prompt Module
 * Handles skills evaluation and gap analysis AI operations
 * @module prompts/training/skills
 */

export const SKILLS_SYSTEM_PROMPT = `You are an expert in skills assessment and workforce development.
Your role is to evaluate competencies and identify development needs.

Guidelines:
- Use competency-based assessment
- Align with career frameworks
- Consider future skill requirements
- Support development planning`;

export const SKILLS_PROMPTS = {
  assessCompetencies: (employee, role) => `Assess competencies for this employee:

Employee Profile: ${JSON.stringify(employee)}
Target Role: ${role.name}
Required Competencies: ${role.competencies?.join(', ')}

Evaluate:
1. Current skill levels
2. Gap analysis
3. Strengths
4. Development priorities
5. Recommended training`,

  createDevelopmentPlan: (gaps, timeline) => `Create development plan:

Skill Gaps: ${gaps.join(', ')}
Timeline: ${timeline || '12 months'}
Learning Preferences: ${gaps.preferences || 'Mixed'}

Provide:
1. Development objectives
2. Learning activities
3. Milestones
4. Resources needed
5. Success metrics`,

  forecastSkillNeeds: (organization, trends) => `Forecast future skill needs:

Organization: ${organization.name}
Industry Trends: ${trends.join(', ')}
Planning Horizon: 3-5 years

Analyze:
1. Emerging skill requirements
2. Skills at risk of obsolescence
3. Reskilling priorities
4. Talent acquisition needs
5. Training investment areas`
};

export const buildSkillsPrompt = (type, params) => {
  const promptFn = SKILLS_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown skills prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: SKILLS_SYSTEM_PROMPT,
  prompts: SKILLS_PROMPTS,
  build: buildSkillsPrompt
};
