/**
 * AI Proposal Screening Prompts
 * Pre-screens innovation proposals for completeness and quality
 * @module citizen/proposalScreening
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate proposal screening prompt
 */
export function generateProposalScreeningPrompt(proposal) {
  return `AI Pre-Screen this Innovation Proposal for completeness and quality:

Title: ${proposal?.title_en || proposal?.title_ar || 'Untitled'}
Description: ${proposal?.description_en || proposal?.description_ar || 'No description'}
Proposal Type: ${proposal?.proposal_type || 'N/A'}
Budget Estimate: ${proposal?.budget_estimate || 'Not specified'} SAR
Timeline: ${proposal?.timeline_proposal || 'Not specified'}
Team: ${proposal?.team_composition?.length || 0} members
Success Metrics: ${proposal?.success_metrics_proposed?.length || 0} defined

Assess the following criteria:
1. Proposal Completeness Score (0-100): Are all required sections filled adequately?
2. Feasibility Score (0-100): Is this technically and operationally feasible?
3. Innovation Type Classification: incremental | radical | disruptive | sustaining
4. Budget Reasonability (boolean): Is the budget estimate reasonable for the scope?
5. Budget Reasonability Score (0-100): How reasonable is the budget?
6. Team Adequacy (boolean): Does the team have adequate expertise?
7. Team Adequacy Score (0-100): Rate the team composition quality
8. Strategic Alignment Preliminary (0-100): Does this align with municipal priorities?
9. Duplicate Check (boolean): Is this similar to existing proposals?
10. Auto Recommendation: approve_for_expert_review | request_clarification | reject_incomplete | merge_with_existing

Provide structured assessment.`;
}

/**
 * Get proposal screening schema
 */
export function getProposalScreeningSchema() {
  return {
    type: "object",
    properties: {
      proposal_completeness_score: { type: "number" },
      feasibility_score: { type: "number" },
      innovation_type_classification: { 
        type: "string",
        enum: ['incremental', 'radical', 'disruptive', 'sustaining']
      },
      budget_reasonability: { type: "boolean" },
      budget_reasonability_score: { type: "number" },
      team_adequacy: { type: "boolean" },
      team_adequacy_score: { type: "number" },
      strategic_alignment_preliminary: { type: "number" },
      duplicate_check: { type: "boolean" },
      auto_recommendation: { 
        type: "string",
        enum: ['approve_for_expert_review', 'request_clarification', 'reject_incomplete', 'merge_with_existing']
      },
      missing_elements: { type: "array", items: { type: "string" } },
      strengths: { type: "array", items: { type: "string" } },
      concerns: { type: "array", items: { type: "string" } }
    }
  };
}

/**
 * Get system prompt for proposal screening
 */
export function getProposalScreeningSystemPrompt() {
  return getSystemPrompt('proposal-screener');
}

export const PROPOSAL_SCREENING_CONFIG = {
  name: 'proposal-screening',
  version: '1.0.0',
  description: 'AI-powered innovation proposal pre-screening'
};
