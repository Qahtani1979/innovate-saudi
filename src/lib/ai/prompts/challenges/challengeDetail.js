/**
 * Challenge Detail Analysis Prompt Module
 * Centralized prompts for challenge detail pages
 * @module prompts/challenges/challengeDetail
 */

import { SAUDI_CONTEXT } from '@/lib/ai/prompts/saudiContext';

/**
 * Challenge detail analysis prompt template
 * @param {Object} challenge - Challenge data
 * @returns {Object} Prompt configuration
 */
export const CHALLENGE_DETAIL_PROMPT_TEMPLATE = (challenge) => ({
  system: `You are an expert challenge analyst specializing in Saudi Arabia's municipal and government sector challenges.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.MUNICIPAL_CONTEXT}

Analyze challenges with focus on:
- Root cause analysis
- Impact assessment
- Stakeholder mapping
- Solution pathway identification
- Resource requirements
- Timeline estimation`,

  prompt: `Analyze this challenge and provide comprehensive insights:

CHALLENGE DETAILS:
- Title: ${challenge.title_en || challenge.title}
- Code: ${challenge.code || 'Not assigned'}
- Status: ${challenge.status || 'Not specified'}
- Priority: ${challenge.priority || 'Not set'}
- Category: ${challenge.category || 'Not categorized'}
- Sector: ${challenge.sector || 'Not specified'}

PROBLEM STATEMENT:
${challenge.problem_statement_en || challenge.description_en || 'Not provided'}

ROOT CAUSES:
${challenge.root_causes ? challenge.root_causes.join(', ') : 'Not identified'}

AFFECTED POPULATION:
${challenge.affected_population_size ? `${challenge.affected_population_size.toLocaleString()} people` : 'Not estimated'}

CURRENT SITUATION:
${challenge.current_situation_en || 'Not documented'}

DESIRED OUTCOME:
${challenge.desired_outcome_en || 'Not defined'}

Provide:
1. Challenge Assessment
2. Root Cause Analysis
3. Impact Analysis
4. Solution Pathways
5. Implementation Recommendations`,

  schema: {
    type: "object",
    properties: {
      assessment: {
        type: "object",
        properties: {
          severity_score: { type: "number", minimum: 1, maximum: 10 },
          urgency_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
          complexity: { type: "string", enum: ["simple", "moderate", "complex", "highly_complex"] },
          key_findings: { type: "array", items: { type: "string" } }
        }
      },
      root_cause_analysis: {
        type: "object",
        properties: {
          primary_causes: { type: "array", items: { type: "string" } },
          contributing_factors: { type: "array", items: { type: "string" } },
          systemic_issues: { type: "array", items: { type: "string" } }
        }
      },
      impact_analysis: {
        type: "object",
        properties: {
          affected_stakeholders: {
            type: "array",
            items: {
              type: "object",
              properties: {
                stakeholder: { type: "string" },
                impact_level: { type: "string", enum: ["high", "medium", "low"] },
                impact_description: { type: "string" }
              }
            }
          },
          economic_impact: { type: "string" },
          social_impact: { type: "string" },
          service_impact: { type: "string" }
        }
      },
      solution_pathways: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pathway: { type: "string" },
            approach: { type: "string" },
            feasibility: { type: "string", enum: ["high", "medium", "low"] },
            estimated_timeline: { type: "string" },
            estimated_cost: { type: "string" },
            success_probability: { type: "number", minimum: 0, maximum: 100 }
          }
        }
      },
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            priority: { type: "number", minimum: 1, maximum: 5 },
            recommendation: { type: "string" },
            rationale: { type: "string" },
            quick_win: { type: "boolean" }
          }
        }
      },
      next_steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            step: { type: "string" },
            owner: { type: "string" },
            timeline: { type: "string" }
          }
        }
      }
    },
    required: ["assessment", "root_cause_analysis", "solution_pathways", "recommendations"]
  }
});

/**
 * Challenge matching prompt template
 * @param {Object} challenge - Challenge data
 * @param {Array} solutions - Available solutions
 * @returns {Object} Prompt configuration
 */
export const CHALLENGE_MATCHING_PROMPT_TEMPLATE = (challenge, solutions) => ({
  system: `You are an expert in matching challenges with appropriate solutions.
${SAUDI_CONTEXT.VISION_2030}

Identify the best-fit solutions based on challenge requirements.`,

  prompt: `Match this challenge with the most suitable solutions:

CHALLENGE:
${JSON.stringify(challenge, null, 2)}

AVAILABLE SOLUTIONS:
${JSON.stringify(solutions, null, 2)}

Provide matching analysis with confidence scores.`,

  schema: {
    type: "object",
    properties: {
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            solution_id: { type: "string" },
            solution_name: { type: "string" },
            match_score: { type: "number", minimum: 0, maximum: 100 },
            match_rationale: { type: "string" },
            implementation_considerations: { type: "array", items: { type: "string" } }
          }
        }
      },
      recommendation: {
        type: "object",
        properties: {
          top_recommendation: { type: "string" },
          rationale: { type: "string" }
        }
      }
    },
    required: ["matches", "recommendation"]
  }
});

export default {
  CHALLENGE_DETAIL_PROMPT_TEMPLATE,
  CHALLENGE_MATCHING_PROMPT_TEMPLATE
};
