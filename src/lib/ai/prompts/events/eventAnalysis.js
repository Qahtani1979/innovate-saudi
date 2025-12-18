/**
 * Event Analysis AI Prompts
 * @module prompts/events/eventAnalysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Event optimization prompt
 */
export const EVENT_OPTIMIZATION_PROMPT_TEMPLATE = (event) => `
Optimize this event for maximum engagement and impact:

Event: ${event.title_en || event.title}
Type: ${event.event_type || 'general'}
Status: ${event.status || 'draft'}
Mode: ${event.mode || 'in_person'}
Date: ${event.start_date} to ${event.end_date}
Location: ${event.location || 'TBD'}
Capacity: ${event.capacity || 'unlimited'}
Registrations: ${event.registration_count || 0}

Description:
${event.description_en || event.description || 'No description'}

${SAUDI_CONTEXT}

Provide optimization suggestions for:
1. Timing and Scheduling
2. Venue and Format
3. Content and Agenda
4. Marketing and Outreach
5. Engagement Strategies
`;

/**
 * Attendance prediction prompt
 */
export const ATTENDANCE_PREDICTION_PROMPT_TEMPLATE = (event, historicalData) => `
Predict attendance and engagement for this event:

Event: ${event.title_en || event.title}
Type: ${event.event_type}
Date: ${event.start_date}
Capacity: ${event.capacity || 'unlimited'}
Current Registrations: ${event.registration_count || 0}

Historical Data:
${historicalData ? JSON.stringify(historicalData, null, 2) : 'No historical data available'}

${SAUDI_CONTEXT}

Predict:
1. Expected Attendance Rate (%)
2. No-show Probability (%)
3. Engagement Level Score (0-100)
4. Peak Attendance Times
5. Recommendations to Improve Attendance
`;

export const EVENT_ANALYSIS_SYSTEM_PROMPT = `You are an event planning analyst specializing in Saudi Arabian government and municipal events. Optimize events for engagement and strategic alignment with Vision 2030.`;

export const EVENT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    attendanceRate: { type: "number" },
    noShowProbability: { type: "number" },
    engagementScore: { type: "number" },
    optimizations: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["attendanceRate", "engagementScore"]
};
