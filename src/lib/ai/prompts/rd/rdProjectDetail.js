/**
 * R&D Project Detail Analysis Prompt Module
 * Centralized prompts for R&D project detail pages
 * @module prompts/rd/rdProjectDetail
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * R&D project detail analysis prompt template
 * @param {Object} project - R&D project data
 * @returns {Object} Prompt configuration
 */
export const RD_PROJECT_DETAIL_PROMPT_TEMPLATE = (project) => ({
  system: `You are an expert R&D analyst specializing in research and development projects for Saudi Arabia's innovation ecosystem.
${SAUDI_CONTEXT.VISION_2030}
${SAUDI_CONTEXT.TECHNOLOGY_PRIORITIES}

Analyze R&D projects with focus on:
- Research methodology and approach
- Innovation potential and IP value
- Commercialization pathway
- Resource requirements and timeline
- Collaboration opportunities
- Alignment with national priorities`,

  prompt: `Analyze this R&D project and provide comprehensive insights:

PROJECT DETAILS:
- Title: ${project.title_en || project.title}
- Status: ${project.status}
- Phase: ${project.phase || 'Not specified'}
- Start Date: ${project.start_date || 'Not set'}
- End Date: ${project.end_date || 'Not set'}
- Budget: ${project.budget ? `SAR ${project.budget.toLocaleString()}` : 'Not specified'}
- Research Area: ${project.research_area || 'Not specified'}

OBJECTIVES:
${project.objectives ? JSON.stringify(project.objectives, null, 2) : 'Not defined'}

METHODOLOGY:
${project.methodology || 'Not documented'}

EXPECTED OUTCOMES:
${project.expected_outcomes ? JSON.stringify(project.expected_outcomes, null, 2) : 'Not defined'}

Provide:
1. Research Quality Assessment
2. Innovation Potential Analysis
3. Commercialization Pathway
4. Resource Optimization Recommendations
5. Collaboration Opportunities`,

  schema: {
    type: "object",
    properties: {
      research_assessment: {
        type: "object",
        properties: {
          quality_score: { type: "number", minimum: 1, maximum: 10 },
          methodology_rating: { type: "string", enum: ["excellent", "good", "adequate", "needs_improvement"] },
          novelty_level: { type: "string", enum: ["breakthrough", "incremental", "applied", "adaptive"] },
          key_strengths: { type: "array", items: { type: "string" } },
          improvement_areas: { type: "array", items: { type: "string" } }
        }
      },
      innovation_potential: {
        type: "object",
        properties: {
          ip_potential: { type: "string", enum: ["high", "medium", "low"] },
          patent_opportunities: { type: "array", items: { type: "string" } },
          market_applications: { type: "array", items: { type: "string" } },
          competitive_advantage: { type: "string" }
        }
      },
      commercialization: {
        type: "object",
        properties: {
          readiness_level: { type: "string", enum: ["ready", "near_ready", "development", "early_stage"] },
          pathway: { type: "string" },
          timeline_estimate: { type: "string" },
          target_sectors: { type: "array", items: { type: "string" } }
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
      collaboration_opportunities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            partner_type: { type: "string" },
            collaboration_area: { type: "string" },
            potential_value: { type: "string" }
          }
        }
      }
    },
    required: ["research_assessment", "innovation_potential", "recommendations"]
  }
});

export default {
  RD_PROJECT_DETAIL_PROMPT_TEMPLATE
};
