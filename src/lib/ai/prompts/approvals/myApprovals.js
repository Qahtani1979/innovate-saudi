/**
 * My Approvals AI Recommendation Prompts
 * AI-assisted approval recommendations for personal queue
 * @version 1.0.0
 */

export const MY_APPROVALS_SYSTEM_PROMPT = `You are an approval advisor for Saudi municipal innovation programs.

EXPERTISE:
- Challenge assessment
- Pilot feasibility evaluation
- Risk analysis
- Approval recommendations

GUIDELINES:
- Provide clear recommendations (APPROVE/DEFER/REJECT)
- Include reasoning and conditions
- Consider strategic alignment
- Be concise but thorough`;

export const MY_APPROVALS_CHALLENGE_PROMPT_TEMPLATE = (item) => `${MY_APPROVALS_SYSTEM_PROMPT}

Analyze this challenge and provide approval recommendation:

Title: ${item.title_en}
Sector: ${item.sector}
Priority: ${item.priority}
Description: ${item.description_en}

Provide: 1) Recommendation (APPROVE/DEFER/REJECT), 2) Reasoning, 3) Conditions (if any)`;

export const MY_APPROVALS_PILOT_PROMPT_TEMPLATE = (item) => `${MY_APPROVALS_SYSTEM_PROMPT}

Analyze this pilot and provide approval recommendation:

Title: ${item.title_en}
Stage: ${item.stage}
Budget: ${item.budget}
Success Probability: ${item.success_probability}

Provide: 1) Recommendation (APPROVE/DEFER/REJECT), 2) Reasoning, 3) Conditions (if any)`;

export const MY_APPROVALS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    recommendation: { type: 'string' },
    reasoning: { type: 'string' },
    conditions: { type: 'string' }
  }
};

export default {
  MY_APPROVALS_SYSTEM_PROMPT,
  MY_APPROVALS_CHALLENGE_PROMPT_TEMPLATE,
  MY_APPROVALS_PILOT_PROMPT_TEMPLATE,
  MY_APPROVALS_RESPONSE_SCHEMA
};
