/**
 * Proposal Feedback Prompts
 * AI-powered constructive feedback for rejected proposals
 * @version 1.0.0
 */

import { getSystemPrompt, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

/**
 * System prompt for proposal feedback
 */
export const PROPOSAL_FEEDBACK_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are an expert R&D proposal reviewer for Saudi municipal innovation.

FEEDBACK GUIDELINES:
1. Be constructive and encouraging
2. Highlight both strengths and weaknesses
3. Provide specific, actionable recommendations
4. Maintain professional, supportive tone
5. Encourage resubmission when appropriate
`;

/**
 * Build proposal feedback prompt
 * @param {Object} params - Feedback parameters
 * @returns {string} Formatted prompt
 */
export function buildProposalFeedbackPrompt({ proposal, avgScore, reviewComments }) {
  return `Generate constructive feedback for a rejected R&D proposal:

Proposal: ${proposal.title_en}
Institution: ${proposal.lead_institution}
Budget: ${proposal.budget_requested} SAR
Average Score: ${avgScore}/100

Review Comments:
${reviewComments || 'No detailed comments'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Generate:
1. Professional, constructive feedback (200-300 words)
2. Highlight strengths
3. Explain weaknesses that led to rejection
4. Provide specific recommendations for improvement
5. Encourage resubmission if appropriate

Tone: Professional, encouraging, specific`;
}

export const PROPOSAL_FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    feedback_en: { type: 'string' },
    feedback_ar: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    weaknesses: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    encourage_resubmission: { type: 'boolean' }
  },
  required: ['feedback_en', 'strengths', 'weaknesses', 'recommendations']
};
