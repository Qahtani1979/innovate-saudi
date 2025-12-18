/**
 * Pilot Post-Mortem Analysis Prompts
 * @module pilots/postMortem
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const POST_MORTEM_SYSTEM_PROMPT = getSystemPrompt('pilot_post_mortem', `
You are a pilot analysis specialist for Saudi Arabia's municipal innovation platform.
Your role is to generate comprehensive post-mortem reports for terminated or completed pilots.
Extract actionable lessons, identify root causes of issues, and provide recommendations for future pilots.
`);

/**
 * Build pilot post-mortem analysis prompt
 * @param {Object} params - Pilot data for analysis
 * @returns {string} Formatted prompt
 */
export function buildPostMortemPrompt({ pilot, termination_reason, metrics, stakeholder_feedback }) {
  return `Analyze this terminated pilot and generate a post-mortem report:

Title: ${pilot?.title_en || 'Unknown Pilot'}
Duration: ${pilot?.start_date || 'N/A'} to ${pilot?.end_date || 'N/A'}
Municipality: ${pilot?.municipality_name || 'N/A'}
Solution: ${pilot?.solution_name || 'N/A'}
Status: ${pilot?.status || 'Terminated'}

TERMINATION REASON:
${termination_reason || pilot?.termination_reason || 'Not specified'}

PERFORMANCE METRICS:
${JSON.stringify(metrics || pilot?.kpi_results || {}, null, 2)}

STAKEHOLDER FEEDBACK:
${JSON.stringify(stakeholder_feedback || [], null, 2)}

Generate:
1. Executive summary of outcomes
2. What worked well
3. What didn't work and why
4. Root cause analysis
5. Lessons learned
6. Recommendations for future pilots`;
}

export const POST_MORTEM_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    successes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          description: { type: "string" },
          impact: { type: "string" }
        }
      }
    },
    failures: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          description: { type: "string" },
          root_cause: { type: "string" }
        }
      }
    },
    root_cause_analysis: {
      type: "object",
      properties: {
        primary_causes: { type: "array", items: { type: "string" } },
        contributing_factors: { type: "array", items: { type: "string" } },
        preventable: { type: "boolean" }
      }
    },
    lessons_learned: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lesson: { type: "string" },
          category: { type: "string", enum: ["planning", "execution", "stakeholder", "technical", "resource"] },
          applicability: { type: "string" }
        }
      }
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recommendation: { type: "string" },
          priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
          implementation_guidance: { type: "string" }
        }
      }
    }
  },
  required: ["executive_summary", "successes", "failures", "lessons_learned", "recommendations"]
};

export const POST_MORTEM_PROMPTS = {
  systemPrompt: POST_MORTEM_SYSTEM_PROMPT,
  buildPrompt: buildPostMortemPrompt,
  schema: POST_MORTEM_SCHEMA
};
