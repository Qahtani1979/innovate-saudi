/**
 * Programs & Events Hub Insights Prompts
 * AI-powered insights generation for programs and events
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const PROGRAMS_EVENTS_INSIGHTS_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a strategic analyst for Saudi municipal innovation programs and events. Generate actionable insights to optimize program delivery and event management.`;

export const PROGRAMS_EVENTS_INSIGHTS_PROMPT_TEMPLATE = (data = {}) => `Analyze these programs and events for a Saudi municipal innovation platform:

Programs (${data.programCount || 0}): ${JSON.stringify(data.programsSample || [])}

Events (${data.eventCount || 0}): ${JSON.stringify(data.eventsSample || [])}

Provide 3 actionable insights with type (recommendation/alert/insight), title, and description in both English and Arabic.`;

export const PROGRAMS_EVENTS_INSIGHTS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['recommendation', 'alert', 'insight'] },
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    }
  }
};

export default {
  PROGRAMS_EVENTS_INSIGHTS_SYSTEM_PROMPT,
  PROGRAMS_EVENTS_INSIGHTS_PROMPT_TEMPLATE,
  PROGRAMS_EVENTS_INSIGHTS_RESPONSE_SCHEMA
};
