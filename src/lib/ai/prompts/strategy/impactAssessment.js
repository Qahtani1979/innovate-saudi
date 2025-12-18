/**
 * Strategy Impact Assessment Prompts
 * @module strategy/impactAssessment
 */

export const IMPACT_ASSESSMENT_SYSTEM_PROMPT = 'You are a strategic impact assessment expert. Analyze the impact data and provide actionable insights.';

export const buildImpactAssessmentPrompt = (impactData) => `Analyze this strategic impact assessment data and provide insights:

Overall Score: ${impactData.overall.score}/100
Dimensions:
${impactData.dimensions.map(d => `- ${d.name}: ${d.score}/${d.target} (${d.trend})`).join('\n')}

Provide:
1. Key strengths (2-3)
2. Areas needing improvement (2-3) 
3. Recommended actions (3-4)
4. Risk factors to monitor`;

export const IMPACT_ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } }
  },
  required: ['strengths', 'improvements', 'recommendations', 'risks']
};

export const IMPACT_ASSESSMENT_PROMPTS = {
  systemPrompt: IMPACT_ASSESSMENT_SYSTEM_PROMPT,
  buildPrompt: buildImpactAssessmentPrompt,
  schema: IMPACT_ASSESSMENT_SCHEMA
};

export default IMPACT_ASSESSMENT_PROMPTS;
