/**
 * TRL Assessment Tool Prompts
 * For assessing Technology Readiness Level of solutions
 * @module prompts/solutions/trlAssessment
 */

export const TRL_ASSESSMENT_SYSTEM_PROMPT = `You are a technology readiness assessor using the NASA TRL scale (1-9).
Provide rigorous, evidence-based assessments of solution maturity.
Be conservative and require clear evidence for higher TRL ratings.`;

export const buildTRLAssessmentPrompt = ({ solution, evidence }) => {
  return `Assess Technology Readiness Level (TRL) for this solution following NASA TRL scale (1-9).

SOLUTION:
Name: ${solution.name_en || 'Solution'}
Description: ${solution.description_en || 'No description'}
Maturity Level: ${solution.maturity_level || 'Unknown'}
Current TRL: ${solution.trl || 'Not assessed'}
Features: ${solution.features?.join(', ') || 'N/A'}
Deployments: ${solution.deployment_count || 0}
Technical Specs: ${JSON.stringify(solution.technical_specifications || {})}

USER PROVIDED EVIDENCE:
${evidence || 'No additional evidence provided'}

TRL SCALE:
TRL 1: Basic principles observed
TRL 2: Technology concept formulated
TRL 3: Experimental proof of concept
TRL 4: Technology validated in lab
TRL 5: Technology validated in relevant environment
TRL 6: Technology demonstrated in relevant environment
TRL 7: System prototype demonstration in operational environment
TRL 8: System complete and qualified
TRL 9: Actual system proven in operational environment

Provide:
1. Assessed TRL level (1-9)
2. Confidence score (0-100%)
3. Evidence supporting assessment
4. Next steps to advance TRL
5. Gaps preventing higher TRL
6. Estimated timeline to next level
7. Detailed reasoning for assessment

Be rigorous and evidence-based.`;
};

export const TRL_ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    assessed_trl: { type: 'number', minimum: 1, maximum: 9, description: 'Assessed TRL level' },
    confidence_score: { type: 'number', description: 'Confidence score 0-100' },
    supporting_evidence: { type: 'array', items: { type: 'string' }, description: 'Evidence supporting assessment' },
    next_steps: { type: 'array', items: { type: 'string' }, description: 'Steps to advance TRL' },
    trl_gaps: { type: 'array', items: { type: 'string' }, description: 'Gaps preventing higher TRL' },
    timeline_to_next_level_months: { type: 'number', description: 'Months to reach next TRL' },
    assessment_reasoning: { type: 'string', description: 'Detailed reasoning' },
    readiness_for_pilot: { type: 'string', enum: ['ready', 'nearly_ready', 'not_ready'] }
  },
  required: ['assessed_trl', 'confidence_score', 'assessment_reasoning', 'readiness_for_pilot']
};

export default {
  system: TRL_ASSESSMENT_SYSTEM_PROMPT,
  buildPrompt: buildTRLAssessmentPrompt,
  schema: TRL_ASSESSMENT_SCHEMA
};
