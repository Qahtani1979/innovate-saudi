/**
 * Event Impact AI Prompts
 * Centralized prompts for event analysis and optimization
 * @module events/impactAnalysis
 */

export const EVENT_IMPACT_SYSTEM_PROMPT = `You are an expert event analyst for Saudi Arabian government innovation events.

ANALYSIS FRAMEWORK:
1. Attendance Analysis
   - Registration vs attendance
   - Demographic breakdown
   - Engagement levels
   - Drop-off patterns

2. Impact Assessment
   - Knowledge transfer
   - Networking outcomes
   - Action item generation
   - Follow-up potential

3. Satisfaction Analysis
   - Overall ratings
   - Session feedback
   - Speaker evaluations
   - Venue assessment

4. ROI Calculation
   - Cost per attendee
   - Engagement value
   - Lead generation
   - Partnership opportunities

CONTEXT:
- Saudi event standards
- Vision 2030 engagement goals
- Arabic/English bilingual support`;

export const EVENT_IMPACT_SCHEMA = {
  type: "object",
  properties: {
    impact_score: { type: "number" },
    attendance_metrics: {
      type: "object",
      properties: {
        registered: { type: "number" },
        attended: { type: "number" },
        attendance_rate: { type: "number" },
        engagement_score: { type: "number" }
      }
    },
    satisfaction_metrics: {
      type: "object",
      properties: {
        overall_rating: { type: "number" },
        content_rating: { type: "number" },
        speaker_rating: { type: "number" },
        venue_rating: { type: "number" }
      }
    },
    outcomes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          outcome: { type: "string" },
          value: { type: "string" },
          follow_up_required: { type: "boolean" }
        }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["impact_score", "attendance_metrics"]
};

export const buildEventImpactPrompt = (eventData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze event impact:

EVENT: ${eventData.name || 'Not specified'}
TYPE: ${eventData.type || 'Conference'}
DATE: ${eventData.date || 'Not specified'}
LOCATION: ${eventData.location || 'Not specified'}

ATTENDANCE:
- Registered: ${eventData.registered || 0}
- Attended: ${eventData.attended || 0}
- Virtual: ${eventData.virtual || 0}

SESSIONS: ${eventData.sessionCount || 0}
SPEAKERS: ${eventData.speakerCount || 0}

FEEDBACK SUMMARY:
${eventData.feedback?.slice(0, 5).map(f => `- ${f}`).join('\n') || 'Not available'}

Provide comprehensive impact analysis with improvement recommendations.`;
};

export const EVENT_IMPACT_PROMPTS = {
  system: EVENT_IMPACT_SYSTEM_PROMPT,
  schema: EVENT_IMPACT_SCHEMA,
  buildPrompt: buildEventImpactPrompt
};

export default EVENT_IMPACT_PROMPTS;
