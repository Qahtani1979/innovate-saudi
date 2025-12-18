/**
 * R&D Call Insights AI Prompts
 * Prompts for analyzing R&D calls and providing strategic insights
 * @module ai/prompts/rd/callInsights
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * R&D Call Strategic Insights Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const RD_CALL_INSIGHTS_PROMPT_TEMPLATE = ({
  title,
  callType,
  status,
  totalFunding,
  researchThemes,
  focusAreas,
  proposalCount,
  deadline,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Analyze this R&D Call for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Call: ${title || 'N/A'}
Type: ${callType || 'N/A'}
Status: ${status || 'N/A'}
Total Funding: ${totalFunding || 'N/A'} SAR
Research Themes: ${researchThemes?.map(t => t.theme || t).join(', ') || 'N/A'}
Focus Areas: ${focusAreas?.join(', ') || 'N/A'}
Number of Proposals: ${proposalCount || 0}
Deadline: ${deadline || 'N/A'}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Strategic alignment with Vision 2030
2. Expected research impact
3. Recommendations to attract quality proposals
4. Potential collaboration opportunities with universities/research centers
5. Risk factors and mitigation suggestions`,
  system: `You are a Saudi R&D and innovation expert. Provide bilingual (English and Arabic) strategic insights for R&D calls in the Saudi municipal context.`,
  schema: {
    type: 'object',
    properties: {
      strategic_alignment: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      expected_impact: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      proposal_recommendations: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      collaboration_opportunities: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      risk_mitigation: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      }
    },
    required: ['strategic_alignment', 'expected_impact', 'proposal_recommendations', 'collaboration_opportunities', 'risk_mitigation']
  }
});

/**
 * R&D Proposal Analysis Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const RD_PROPOSAL_ANALYSIS_PROMPT_TEMPLATE = ({
  proposalTitle,
  abstract,
  methodology,
  budget,
  timeline,
  teamQualifications,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Analyze this R&D proposal:

Title: ${proposalTitle || 'N/A'}
Abstract: ${abstract?.substring(0, 500) || 'N/A'}
Methodology: ${methodology?.substring(0, 300) || 'N/A'}
Budget: ${budget || 'N/A'} SAR
Timeline: ${timeline || 'N/A'}
Team: ${teamQualifications || 'N/A'}

Provide:
1. Scientific merit assessment
2. Feasibility evaluation
3. Innovation potential
4. Alignment with Saudi municipal priorities
5. Recommendations for improvement`,
  system: `You are a Saudi R&D proposal evaluator. Assess proposals for scientific merit, feasibility, and relevance to Saudi municipal innovation.`,
  schema: {
    type: 'object',
    properties: {
      scientific_merit: { type: 'object', properties: { score: { type: 'number' }, assessment: { type: 'string' } } },
      feasibility: { type: 'object', properties: { score: { type: 'number' }, assessment: { type: 'string' } } },
      innovation_potential: { type: 'object', properties: { score: { type: 'number' }, assessment: { type: 'string' } } },
      alignment_score: { type: 'number' },
      recommendations: { type: 'array', items: { type: 'string' } }
    }
  }
});

export default {
  RD_CALL_INSIGHTS_PROMPT_TEMPLATE,
  RD_PROPOSAL_ANALYSIS_PROMPT_TEMPLATE
};
