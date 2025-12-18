/**
 * Solution Detail Analysis Prompt Module
 * Centralized prompts for solution detail pages
 * @module prompts/solutions/solutionDetail
 */

import { SAUDI_CONTEXT } from '../saudiContext';

/**
 * Solution detail analysis prompt template
 * @param {Object} solution - Solution data
 * @returns {Object} Prompt configuration
 */
export const SOLUTION_DETAIL_PROMPT_TEMPLATE = (solution) => ({
  system: `You are an expert solution analyst specializing in technology and innovation solutions for Saudi Arabia's public sector.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.TECHNOLOGY_PRIORITIES}

Analyze solutions with focus on:
- Technical feasibility and maturity
- Implementation requirements
- Cost-benefit analysis
- Risk assessment
- Alignment with Vision 2030 objectives
- Scalability and sustainability`,

  prompt: `Analyze this solution and provide comprehensive insights:

SOLUTION DETAILS:
- Name: ${solution.name_en || solution.name}
- Category: ${solution.category || 'Not specified'}
- Provider: ${solution.provider_name || 'Not specified'}
- Status: ${solution.status || 'Not specified'}
- Maturity Level: ${solution.maturity_level || 'Not assessed'}

DESCRIPTION:
${solution.description_en || solution.description || 'Not provided'}

TECHNICAL SPECIFICATIONS:
${solution.technical_specs ? JSON.stringify(solution.technical_specs, null, 2) : 'Not provided'}

IMPLEMENTATION DETAILS:
- Timeline: ${solution.implementation_timeline || 'Not specified'}
- Cost Range: ${solution.cost_range || 'Not specified'}
- Requirements: ${solution.requirements ? JSON.stringify(solution.requirements) : 'Not specified'}

Provide:
1. Solution Assessment
2. Implementation Readiness
3. Cost-Benefit Analysis
4. Risk Assessment
5. Recommendations`,

  schema: {
    type: "object",
    properties: {
      assessment: {
        type: "object",
        properties: {
          overall_score: { type: "number", minimum: 1, maximum: 10 },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          vision_alignment: { type: "string", enum: ["high", "medium", "low"] }
        }
      },
      implementation_readiness: {
        type: "object",
        properties: {
          readiness_level: { type: "string", enum: ["ready", "near_ready", "needs_preparation", "not_ready"] },
          prerequisites: { type: "array", items: { type: "string" } },
          estimated_timeline: { type: "string" },
          resource_requirements: { type: "array", items: { type: "string" } }
        }
      },
      cost_benefit: {
        type: "object",
        properties: {
          roi_estimate: { type: "string" },
          payback_period: { type: "string" },
          benefits: { type: "array", items: { type: "string" } },
          costs: { type: "array", items: { type: "string" } }
        }
      },
      risks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            risk: { type: "string" },
            impact: { type: "string", enum: ["low", "medium", "high"] },
            mitigation: { type: "string" }
          }
        }
      },
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["high", "medium", "low"] },
            recommendation: { type: "string" },
            rationale: { type: "string" }
          }
        }
      }
    },
    required: ["assessment", "implementation_readiness", "recommendations"]
  }
});

/**
 * Solution comparison prompt template
 * @param {Object} solution - Current solution
 * @param {Array} alternatives - Alternative solutions
 * @returns {Object} Prompt configuration
 */
export const SOLUTION_COMPARISON_PROMPT_TEMPLATE = (solution, alternatives) => ({
  system: `You are an expert in comparative analysis of technology solutions.
${SAUDI_CONTEXT.VISION_2030}

Provide objective, data-driven comparisons.`,

  prompt: `Compare this solution with alternatives:

PRIMARY SOLUTION:
${JSON.stringify(solution, null, 2)}

ALTERNATIVES:
${JSON.stringify(alternatives, null, 2)}

Provide comparative analysis across key dimensions.`,

  schema: {
    type: "object",
    properties: {
      comparison_matrix: {
        type: "array",
        items: {
          type: "object",
          properties: {
            dimension: { type: "string" },
            primary_score: { type: "number" },
            alternative_scores: { type: "array", items: { type: "number" } }
          }
        }
      },
      recommendation: {
        type: "object",
        properties: {
          best_fit: { type: "string" },
          rationale: { type: "string" },
          use_cases: { type: "array", items: { type: "string" } }
        }
      }
    },
    required: ["comparison_matrix", "recommendation"]
  }
});

export default {
  SOLUTION_DETAIL_PROMPT_TEMPLATE,
  SOLUTION_COMPARISON_PROMPT_TEMPLATE
};
