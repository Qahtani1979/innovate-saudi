/**
 * Pilot Detail Analysis Prompt Module
 * Centralized prompts for pilot program detail analysis
 * @module prompts/pilots/pilotDetail
 */

import { SAUDI_CONTEXT } from '../saudiContext';

/**
 * Pilot detail analysis prompt template
 * @param {Object} pilot - Pilot program data
 * @returns {Object} Prompt configuration
 */
export const PILOT_DETAIL_PROMPT_TEMPLATE = (pilot) => ({
  system: `You are an expert pilot program analyst specializing in Saudi Arabia's Vision 2030 innovation initiatives.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.MUNICIPAL_CONTEXT}

Analyze pilot programs with focus on:
- Progress against milestones and KPIs
- Risk assessment and mitigation strategies
- Resource utilization efficiency
- Stakeholder engagement effectiveness
- Scalability potential assessment
- Lessons learned and best practices

Provide actionable recommendations for pilot optimization.`,

  prompt: `Analyze this pilot program and provide comprehensive insights:

PILOT DETAILS:
- Title: ${pilot.title_en || pilot.title}
- Status: ${pilot.status}
- Phase: ${pilot.current_phase || 'Not specified'}
- Start Date: ${pilot.start_date || 'Not set'}
- End Date: ${pilot.end_date || 'Not set'}
- Budget: ${pilot.budget ? `SAR ${pilot.budget.toLocaleString()}` : 'Not specified'}
- Location: ${pilot.location || 'Not specified'}

OBJECTIVES:
${pilot.objectives ? JSON.stringify(pilot.objectives, null, 2) : 'Not defined'}

SUCCESS METRICS:
${pilot.success_metrics ? JSON.stringify(pilot.success_metrics, null, 2) : 'Not defined'}

CURRENT PROGRESS:
${pilot.progress_percentage ? `${pilot.progress_percentage}%` : 'Not tracked'}

Provide:
1. Progress Assessment (current status vs planned)
2. Risk Analysis (identified risks and mitigation)
3. Performance Insights (KPI trends)
4. Stakeholder Impact Analysis
5. Recommendations for Improvement
6. Scalability Assessment`,

  schema: {
    type: "object",
    properties: {
      progress_assessment: {
        type: "object",
        properties: {
          overall_status: { type: "string", enum: ["on_track", "at_risk", "delayed", "ahead"] },
          completion_estimate: { type: "number" },
          key_achievements: { type: "array", items: { type: "string" } },
          pending_milestones: { type: "array", items: { type: "string" } }
        }
      },
      risk_analysis: {
        type: "array",
        items: {
          type: "object",
          properties: {
            risk: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            likelihood: { type: "string", enum: ["unlikely", "possible", "likely", "certain"] },
            mitigation: { type: "string" }
          }
        }
      },
      performance_insights: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metric: { type: "string" },
            trend: { type: "string", enum: ["improving", "stable", "declining"] },
            insight: { type: "string" }
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
            expected_impact: { type: "string" }
          }
        }
      },
      scalability_assessment: {
        type: "object",
        properties: {
          readiness_score: { type: "number", minimum: 1, maximum: 10 },
          scale_potential: { type: "string", enum: ["high", "medium", "low"] },
          prerequisites: { type: "array", items: { type: "string" } },
          recommended_approach: { type: "string" }
        }
      }
    },
    required: ["progress_assessment", "risk_analysis", "recommendations"]
  }
});

/**
 * Pilot lessons learned prompt template
 * @param {Object} pilot - Pilot program data
 * @returns {Object} Prompt configuration
 */
export const PILOT_LESSONS_PROMPT_TEMPLATE = (pilot) => ({
  system: `You are an expert in capturing and documenting lessons learned from pilot programs.
${SAUDI_CONTEXT.VISION_2030}

Focus on extracting actionable insights that can benefit future initiatives.`,

  prompt: `Extract lessons learned from this pilot program:

PILOT: ${pilot.title_en || pilot.title}
STATUS: ${pilot.status}
DURATION: ${pilot.start_date} to ${pilot.end_date || 'ongoing'}

CHALLENGES ENCOUNTERED:
${pilot.challenges ? JSON.stringify(pilot.challenges, null, 2) : 'Not documented'}

OUTCOMES:
${pilot.outcomes ? JSON.stringify(pilot.outcomes, null, 2) : 'Not documented'}

Generate comprehensive lessons learned.`,

  schema: {
    type: "object",
    properties: {
      successes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: { type: "string" },
            lesson: { type: "string" },
            replicability: { type: "string", enum: ["high", "medium", "low"] }
          }
        }
      },
      challenges: {
        type: "array",
        items: {
          type: "object",
          properties: {
            challenge: { type: "string" },
            lesson: { type: "string" },
            prevention_strategy: { type: "string" }
          }
        }
      },
      recommendations_for_future: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["successes", "challenges", "recommendations_for_future"]
  }
});

export default {
  PILOT_DETAIL_PROMPT_TEMPLATE,
  PILOT_LESSONS_PROMPT_TEMPLATE
};
