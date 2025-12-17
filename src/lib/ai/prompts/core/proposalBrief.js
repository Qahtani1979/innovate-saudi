/**
 * Proposal Submission Brief Prompt
 * Used by: ProposalSubmissionWizard.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildProposalBriefPrompt = (proposal) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are generating a submission brief for an R&D proposal to help reviewers.

## PROPOSAL DETAILS

### Basic Information
- Title: ${proposal.title_en || proposal.title}
- Research Area: ${proposal.research_area}
- Institution: ${proposal.institution}
- Budget: ${proposal.budget} SAR
- Duration: ${proposal.duration_months} months

### Abstract
${proposal.abstract_en || proposal.abstract || 'Not provided'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## BRIEF REQUIREMENTS
Provide:
1. Executive summary (2-3 sentences)
2. Key strengths (3 points)
3. Potential concerns (2 points)
4. Recommendation for reviewers (approve/conditional/reject with brief reason)

Focus on:
- Alignment with Vision 2030
- Research quality and methodology
- Team qualifications
- Budget justification
- Expected impact on Saudi municipalities`;
};

export const proposalBriefSchema = {
  type: 'object',
  required: ['executive_summary', 'recommendation'],
  properties: {
    executive_summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' }
  }
};

export const PROPOSAL_BRIEF_SYSTEM_PROMPT = `You are an R&D proposal evaluation specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You generate concise submission briefs to help reviewers quickly understand and evaluate research proposals for municipal innovation.`;
