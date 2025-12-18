/**
 * Event Detail Analysis Prompt Module
 * Centralized prompts for event detail pages
 * @module prompts/events/eventDetail
 */

import { SAUDI_CONTEXT } from '@/lib/ai/prompts/saudiContext';

/**
 * Event detail analysis prompt template
 * @param {Object} event - Event data
 * @returns {Object} Prompt configuration
 */
export const EVENT_DETAIL_PROMPT_TEMPLATE = (event) => ({
  system: `You are an expert event analyst specializing in innovation events and conferences for Saudi Arabia's public sector.
${SAUDI_CONTEXT.VISION_2030}

Analyze events with focus on:
- Event objectives and alignment
- Audience engagement potential
- Content and speaker quality
- Logistics and resource planning
- Expected outcomes and impact
- Success metrics`,

  prompt: `Analyze this event and provide comprehensive insights:

EVENT DETAILS:
- Title: ${event.title_en || event.title}
- Type: ${event.event_type || 'Not specified'}
- Status: ${event.status}
- Date: ${event.event_date || 'Not set'}
- Location: ${event.location || 'Not specified'}
- Format: ${event.format || 'Not specified'}
- Expected Attendees: ${event.expected_attendees || 'Not estimated'}

OBJECTIVES:
${event.objectives ? JSON.stringify(event.objectives, null, 2) : 'Not defined'}

AGENDA:
${event.agenda ? JSON.stringify(event.agenda, null, 2) : 'Not defined'}

TARGET AUDIENCE:
${event.target_audience || 'Not specified'}

Provide:
1. Event Readiness Assessment
2. Engagement Strategy Recommendations
3. Content Quality Evaluation
4. Logistics Checklist
5. Success Metrics Framework`,

  schema: {
    type: "object",
    properties: {
      readiness_assessment: {
        type: "object",
        properties: {
          overall_readiness: { type: "string", enum: ["ready", "mostly_ready", "needs_work", "not_ready"] },
          readiness_score: { type: "number", minimum: 1, maximum: 10 },
          completed_items: { type: "array", items: { type: "string" } },
          pending_items: { type: "array", items: { type: "string" } },
          critical_gaps: { type: "array", items: { type: "string" } }
        }
      },
      engagement_strategy: {
        type: "object",
        properties: {
          pre_event_tactics: { type: "array", items: { type: "string" } },
          during_event_tactics: { type: "array", items: { type: "string" } },
          post_event_tactics: { type: "array", items: { type: "string" } },
          engagement_channels: { type: "array", items: { type: "string" } }
        }
      },
      content_evaluation: {
        type: "object",
        properties: {
          relevance_score: { type: "number", minimum: 1, maximum: 10 },
          agenda_strengths: { type: "array", items: { type: "string" } },
          content_gaps: { type: "array", items: { type: "string" } },
          speaker_recommendations: { type: "array", items: { type: "string" } }
        }
      },
      logistics_checklist: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            item: { type: "string" },
            priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
            status: { type: "string", enum: ["complete", "in_progress", "not_started"] }
          }
        }
      },
      success_metrics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metric: { type: "string" },
            target: { type: "string" },
            measurement_method: { type: "string" }
          }
        }
      }
    },
    required: ["readiness_assessment", "engagement_strategy", "success_metrics"]
  }
});

export default {
  EVENT_DETAIL_PROMPT_TEMPLATE
};
