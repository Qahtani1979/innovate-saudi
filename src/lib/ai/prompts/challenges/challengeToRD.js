/**
 * Challenge to R&D Wizard Prompts
 * Centralized prompts for R&D project creation from challenges
 * @module challenges/challengeToRD
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for challenge to R&D conversion
 */
export const CHALLENGE_TO_RD_SYSTEM_PROMPT = getSystemPrompt('challenges_rd_conversion');

/**
 * Build prompt for R&D scope generation
 * @param {Object} challenge - Challenge data
 * @returns {string} Formatted prompt
 */
export const buildRDScopePrompt = (challenge) => `Generate R&D project scope for this challenge:

Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}
${challenge.root_cause_en ? `Root Cause: ${challenge.root_cause_en}` : ''}
${challenge.desired_outcome_en ? `Desired Outcome: ${challenge.desired_outcome_en}` : ''}

Provide:
1. R&D project title (concise, research-focused)
2. Research questions (3-5 specific questions)
3. Expected research outputs (deliverables)
4. Methodology suggestions (approach)
5. Timeline estimate (months)`;

/**
 * JSON schema for R&D scope
 */
export const RD_SCOPE_SCHEMA = {
  type: 'object',
  properties: {
    project_title: { type: 'string' },
    research_questions: { type: 'array', items: { type: 'string' } },
    expected_outputs: { type: 'array', items: { type: 'string' } },
    methodology: { type: 'string' },
    timeline_months: { type: 'number' }
  },
  required: ['project_title', 'research_questions', 'expected_outputs']
};

/**
 * Build prompt for full R&D project proposal
 * @param {Object} challenge - Challenge data
 * @param {Object} scope - Generated scope
 * @returns {string} Formatted prompt
 */
export const buildRDProposalPrompt = (challenge, scope) => `Develop a full R&D project proposal:

CHALLENGE:
- Title: ${challenge.title_en}
- Sector: ${challenge.sector}
- Description: ${challenge.description_en}

INITIAL SCOPE:
- Title: ${scope.project_title}
- Questions: ${scope.research_questions?.join(', ')}

Generate comprehensive proposal including:
1. Abstract (bilingual EN/AR, 200 words each)
2. Objectives (3-5 SMART objectives)
3. Literature review outline
4. Detailed methodology
5. Work packages and timeline
6. Budget breakdown estimate
7. Risk assessment
8. Expected impact on municipal services`;

/**
 * JSON schema for R&D proposal
 */
export const RD_PROPOSAL_SCHEMA = {
  type: 'object',
  properties: {
    abstract_en: { type: 'string' },
    abstract_ar: { type: 'string' },
    objectives: { type: 'array', items: { type: 'string' } },
    literature_outline: { type: 'array', items: { type: 'string' } },
    methodology_detailed: { type: 'string' },
    work_packages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          duration_months: { type: 'number' },
          deliverables: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    budget_estimate: {
      type: 'object',
      properties: {
        personnel: { type: 'number' },
        equipment: { type: 'number' },
        operations: { type: 'number' },
        total: { type: 'number' }
      }
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk: { type: 'string' },
          probability: { type: 'string' },
          mitigation: { type: 'string' }
        }
      }
    },
    expected_impact: { type: 'string' }
  }
};

/**
 * Challenge to R&D prompts namespace
 */
export const CHALLENGE_TO_RD_PROMPTS = {
  systemPrompt: CHALLENGE_TO_RD_SYSTEM_PROMPT,
  buildScopePrompt: buildRDScopePrompt,
  scopeSchema: RD_SCOPE_SCHEMA,
  buildProposalPrompt: buildRDProposalPrompt,
  proposalSchema: RD_PROPOSAL_SCHEMA
};

export default CHALLENGE_TO_RD_PROMPTS;
