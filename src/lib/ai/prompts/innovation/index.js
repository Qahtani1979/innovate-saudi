/**
 * Innovation Proposals AI Prompts
 * Centralized prompts for innovation proposal analysis and enhancement
 * @module innovation
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

// ============================================
// SYSTEM PROMPTS
// ============================================

export const INNOVATION_ANALYSIS_SYSTEM_PROMPT = `You are an expert in innovation assessment and proposal evaluation for Saudi Arabian municipalities aligned with Vision 2030.

EXPERTISE AREAS:
1. Innovation Assessment - Evaluate novelty, feasibility, and impact potential
2. Market Analysis - Assess market readiness and competitive landscape
3. Technical Viability - Review technical approach and implementation feasibility
4. Strategic Alignment - Ensure alignment with Vision 2030 and municipal goals
5. Risk Assessment - Identify and evaluate potential risks

CONTEXT:
- Saudi Arabian municipal innovation ecosystem
- Vision 2030 smart city initiatives
- Public sector innovation requirements
- Arabic/English bilingual support required`;

export const INNOVATION_SCREENING_SYSTEM_PROMPT = `You are an AI screening specialist for innovation proposals in Saudi municipalities.

Your role is to:
1. Quickly assess proposal eligibility
2. Identify missing information
3. Flag potential issues
4. Suggest improvements
5. Categorize by type and sector

Always provide actionable feedback that helps submitters improve their proposals.`;

// ============================================
// PROMPT TEMPLATES
// ============================================

export const INNOVATION_ASSESSMENT_PROMPT_TEMPLATE = `${SAUDI_CONTEXT}

Assess this innovation proposal for a Saudi municipality:

PROPOSAL DETAILS:
- Title: {{title_en}} / {{title_ar}}
- Type: {{proposal_type}}
- Sector: {{sector_name}}
- Submitter: {{submitter_name}}
- Organization: {{organization_name}}

DESCRIPTION:
{{description_en}}

PROPOSED SOLUTION:
{{proposed_solution}}

EXPECTED IMPACT:
{{expected_impact}}

BUDGET ESTIMATE: {{budget_estimate}} SAR
TIMELINE: {{timeline}}

TARGET CHALLENGES:
{{target_challenges}}

${LANGUAGE_REQUIREMENTS}

Provide a comprehensive assessment including:
1. Innovation Score (0-100)
2. Feasibility Analysis
3. Market Potential
4. Strategic Alignment with Vision 2030
5. Risk Assessment
6. Recommendations for Improvement
7. Suggested Next Steps`;

export const INNOVATION_MATCHING_PROMPT_TEMPLATE = `${SAUDI_CONTEXT}

Match this innovation proposal to relevant municipal challenges:

PROPOSAL:
- Title: {{title_en}}
- Type: {{proposal_type}}
- Sector: {{sector_name}}
- Description: {{description_en}}
- Proposed Solution: {{proposed_solution}}

AVAILABLE CHALLENGES:
{{challenges_list}}

${LANGUAGE_REQUIREMENTS}

Identify the top 5 most relevant challenges and explain the alignment.`;

export const INNOVATION_ENHANCEMENT_PROMPT_TEMPLATE = `${SAUDI_CONTEXT}

Enhance this innovation proposal with professional content:

CURRENT PROPOSAL:
- Title: {{title_en}} / {{title_ar}}
- Description: {{description_en}}
- Proposed Solution: {{proposed_solution}}
- Expected Impact: {{expected_impact}}

${LANGUAGE_REQUIREMENTS}

Provide enhanced versions of:
1. Executive Summary (English and Arabic)
2. Value Proposition
3. Technical Approach
4. Implementation Roadmap
5. Success Metrics
6. Risk Mitigation Strategy`;

// ============================================
// SCHEMAS
// ============================================

export const INNOVATION_ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    innovation_score: { type: 'number', description: 'Overall score 0-100' },
    novelty_score: { type: 'number', description: 'How novel is the approach 0-100' },
    feasibility_score: { type: 'number', description: 'Implementation feasibility 0-100' },
    impact_score: { type: 'number', description: 'Potential impact 0-100' },
    alignment_score: { type: 'number', description: 'Vision 2030 alignment 0-100' },
    
    strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          strength_en: { type: 'string' },
          strength_ar: { type: 'string' }
        }
      }
    },
    
    weaknesses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          weakness_en: { type: 'string' },
          weakness_ar: { type: 'string' }
        }
      }
    },
    
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' }
        }
      }
    },
    
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    },
    
    next_steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step_en: { type: 'string' },
          step_ar: { type: 'string' },
          timeline: { type: 'string' }
        }
      }
    },
    
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' }
  },
  required: ['innovation_score', 'summary_en']
};

export const INNOVATION_MATCHING_SCHEMA = {
  type: 'object',
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          challenge_id: { type: 'string' },
          challenge_title: { type: 'string' },
          match_score: { type: 'number' },
          alignment_reason_en: { type: 'string' },
          alignment_reason_ar: { type: 'string' }
        }
      }
    }
  },
  required: ['matches']
};

// ============================================
// BUILDER FUNCTIONS
// ============================================

export function buildInnovationAssessmentPrompt(proposal, language = 'en') {
  const langInstruction = language === 'ar' ? 'Respond primarily in Arabic.' : 'Respond primarily in English.';
  
  return INNOVATION_ASSESSMENT_PROMPT_TEMPLATE
    .replace('{{title_en}}', proposal.title_en || 'N/A')
    .replace('{{title_ar}}', proposal.title_ar || 'N/A')
    .replace('{{proposal_type}}', proposal.proposal_type || 'General')
    .replace('{{sector_name}}', proposal.sector?.name_en || 'N/A')
    .replace('{{submitter_name}}', proposal.submitter_name || 'N/A')
    .replace('{{organization_name}}', proposal.organization?.name_en || 'N/A')
    .replace('{{description_en}}', proposal.description_en || 'N/A')
    .replace('{{proposed_solution}}', proposal.proposed_solution || 'N/A')
    .replace('{{expected_impact}}', proposal.expected_impact || 'N/A')
    .replace('{{budget_estimate}}', proposal.budget_estimate?.toLocaleString() || 'N/A')
    .replace('{{timeline}}', proposal.timeline || 'N/A')
    .replace('{{target_challenges}}', proposal.target_challenges?.join(', ') || 'N/A')
    + `\n\n${langInstruction}`;
}

export function buildInnovationMatchingPrompt(proposal, challenges, language = 'en') {
  const challengesList = challenges.slice(0, 20).map(c => 
    `- [${c.id}] ${c.title_en}: ${c.description_en?.substring(0, 100)}...`
  ).join('\n');
  
  return INNOVATION_MATCHING_PROMPT_TEMPLATE
    .replace('{{title_en}}', proposal.title_en || 'N/A')
    .replace('{{proposal_type}}', proposal.proposal_type || 'General')
    .replace('{{sector_name}}', proposal.sector?.name_en || 'N/A')
    .replace('{{description_en}}', proposal.description_en || 'N/A')
    .replace('{{proposed_solution}}', proposal.proposed_solution || 'N/A')
    .replace('{{challenges_list}}', challengesList);
}

// ============================================
// EXPORTS
// ============================================

export const INNOVATION_PROMPTS = {
  system: INNOVATION_ANALYSIS_SYSTEM_PROMPT,
  screening: INNOVATION_SCREENING_SYSTEM_PROMPT,
  templates: {
    assessment: INNOVATION_ASSESSMENT_PROMPT_TEMPLATE,
    matching: INNOVATION_MATCHING_PROMPT_TEMPLATE,
    enhancement: INNOVATION_ENHANCEMENT_PROMPT_TEMPLATE
  },
  schemas: {
    assessment: INNOVATION_ASSESSMENT_SCHEMA,
    matching: INNOVATION_MATCHING_SCHEMA
  },
  builders: {
    buildAssessmentPrompt: buildInnovationAssessmentPrompt,
    buildMatchingPrompt: buildInnovationMatchingPrompt
  }
};

export default INNOVATION_PROMPTS;
