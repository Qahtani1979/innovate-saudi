/**
 * R&D Call Matcher Prompts
 * AI-powered matching of researchers to R&D funding calls
 * @version 1.0.0
 */

import { getSystemPrompt, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const RD_CALL_MATCHER_SYSTEM_PROMPT = getSystemPrompt('INNOVATION', true) + `

You are an R&D funding opportunity specialist for Saudi Arabia's municipal innovation ecosystem.
Your role is to match researchers with relevant R&D calls based on expertise and eligibility.
Focus on alignment with call requirements, researcher track record, and success probability.
`;

/**
 * Build R&D call matching prompt
 * @param {Object} researcher - Researcher profile
 * @param {Array} rdCalls - Available R&D calls
 * @returns {string} Formatted prompt
 */
export function buildRDCallMatcherPrompt(researcher, rdCalls = []) {
  return `Match this researcher to relevant R&D funding calls:

RESEARCHER PROFILE:
Name: ${researcher.name_en || researcher.full_name_en || 'Unknown'}
Institution: ${researcher.institution || 'Not specified'}
Department: ${researcher.department || 'Not specified'}
Research Areas: ${researcher.research_areas?.join(', ') || 'General'}
Expertise Keywords: ${researcher.expertise_keywords?.join(', ') || 'Not specified'}
H-Index: ${researcher.h_index || 'Unknown'}
Previous Grants: ${researcher.grant_count || 0}
Active Projects: ${researcher.active_project_count || 0}

AVAILABLE R&D CALLS:
${rdCalls.slice(0, 15).map(call => `
- ${call.code}: ${call.title_en}
  Theme: ${call.theme_en || 'General'}
  Budget: ${call.budget_total ? `${(call.budget_total / 1000000).toFixed(1)}M SAR` : 'TBD'}
  Deadline: ${call.close_date ? new Date(call.close_date).toLocaleDateString() : 'Rolling'}
  Eligibility: ${call.eligibility_criteria?.join(', ') || 'Open'}
  Focus Areas: ${call.focus_areas?.join(', ') || 'Various'}
`).join('\n') || 'No R&D calls available'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Provide:
1. Top 5 matching R&D calls with match scores
2. Eligibility assessment for each
3. Competitiveness analysis
4. Proposal strategy recommendations`;
}

export const RD_CALL_MATCHER_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          call_code: { type: "string" },
          call_title: { type: "string" },
          match_score: { type: "number" },
          eligibility_status: {
            type: "string",
            enum: ["eligible", "likely_eligible", "needs_verification", "ineligible"]
          },
          eligibility_notes: { type: "string" },
          expertise_alignment: { type: "array", items: { type: "string" } },
          competitiveness_score: { type: "number" },
          success_probability: { type: "string" }
        },
        required: ["call_code", "call_title", "match_score", "eligibility_status"]
      }
    },
    proposal_strategies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          call_code: { type: "string" },
          approach_en: { type: "string" },
          approach_ar: { type: "string" },
          key_strengths_to_highlight: { type: "array", items: { type: "string" } },
          suggested_collaborators: { type: "array", items: { type: "string" } }
        },
        required: ["call_code", "approach_en"]
      }
    },
    overall_recommendations: {
      type: "object",
      properties: {
        priority_calls: { type: "array", items: { type: "string" } },
        preparation_tips: { type: "array", items: { type: "string" } },
        timeline_advice: { type: "string" }
      },
      required: ["priority_calls", "preparation_tips"]
    }
  },
  required: ["matches"]
};

export const RD_CALL_MATCHER_PROMPTS = {
  systemPrompt: RD_CALL_MATCHER_SYSTEM_PROMPT,
  buildPrompt: buildRDCallMatcherPrompt,
  schema: RD_CALL_MATCHER_SCHEMA
};

export default RD_CALL_MATCHER_PROMPTS;
