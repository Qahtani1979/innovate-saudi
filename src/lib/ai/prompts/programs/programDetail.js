/**
 * Program Detail Analysis Prompt Module
 * Centralized prompts for program detail pages
 * @module prompts/programs/programDetail
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Program detail analysis prompt template
 * @param {Object} program - Program data
 * @returns {Object} Prompt configuration
 */
export const PROGRAM_DETAIL_PROMPT_TEMPLATE = (program) => ({
  system: `You are an expert program analyst specializing in innovation and capacity building programs for Saudi Arabia's public sector.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.MUNICIPAL_CONTEXT}

Analyze programs with focus on:
- Program effectiveness and outcomes
- Participant engagement and success
- Curriculum and content quality
- Resource utilization
- Impact measurement
- Scaling potential`,

  prompt: `Analyze this program and provide comprehensive insights:

PROGRAM DETAILS:
- Name: ${program.name_en || program.name}
- Type: ${program.program_type || 'Not specified'}
- Status: ${program.status}
- Start Date: ${program.start_date || 'Not set'}
- End Date: ${program.end_date || 'Not set'}
- Budget: ${program.budget ? `SAR ${program.budget.toLocaleString()}` : 'Not specified'}
- Target Audience: ${program.target_audience || 'Not specified'}

OBJECTIVES:
${program.objectives ? JSON.stringify(program.objectives, null, 2) : 'Not defined'}

CURRICULUM:
${program.curriculum ? JSON.stringify(program.curriculum, null, 2) : 'Not defined'}

METRICS:
- Participants: ${program.participant_count || 0}
- Completion Rate: ${program.completion_rate || 'N/A'}%
- Satisfaction Score: ${program.satisfaction_score || 'N/A'}

Provide:
1. Program Effectiveness Assessment
2. Participant Success Analysis
3. Content Quality Evaluation
4. Resource Optimization Recommendations
5. Scaling Potential Assessment`,

  schema: {
    type: "object",
    properties: {
      effectiveness_assessment: {
        type: "object",
        properties: {
          overall_score: { type: "number", minimum: 1, maximum: 10 },
          outcome_achievement: { type: "string", enum: ["exceeding", "meeting", "partially_meeting", "not_meeting"] },
          key_successes: { type: "array", items: { type: "string" } },
          improvement_areas: { type: "array", items: { type: "string" } }
        }
      },
      participant_analysis: {
        type: "object",
        properties: {
          engagement_level: { type: "string", enum: ["high", "medium", "low"] },
          success_factors: { type: "array", items: { type: "string" } },
          dropout_risks: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      },
      content_evaluation: {
        type: "object",
        properties: {
          relevance_score: { type: "number", minimum: 1, maximum: 10 },
          strengths: { type: "array", items: { type: "string" } },
          gaps: { type: "array", items: { type: "string" } },
          update_recommendations: { type: "array", items: { type: "string" } }
        }
      },
      resource_optimization: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: { type: "string" },
            current_state: { type: "string" },
            recommendation: { type: "string" },
            expected_savings: { type: "string" }
          }
        }
      },
      scaling_assessment: {
        type: "object",
        properties: {
          readiness_score: { type: "number", minimum: 1, maximum: 10 },
          scale_potential: { type: "string", enum: ["high", "medium", "low"] },
          prerequisites: { type: "array", items: { type: "string" } },
          recommended_approach: { type: "string" }
        }
      }
    },
    required: ["effectiveness_assessment", "participant_analysis", "scaling_assessment"]
  }
});

export default {
  PROGRAM_DETAIL_PROMPT_TEMPLATE
};
