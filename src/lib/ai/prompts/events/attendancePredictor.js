/**
 * Attendance Predictor AI Prompt
 * Predicts event attendance and provides optimization recommendations
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields, scoreField } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generate attendance prediction prompt
 * @param {Object} event - Event details
 * @param {number} registrationCount - Current registrations
 * @param {Array} historicalData - Past event attendance data
 * @returns {string} Complete prompt
 */
export function getAttendancePredictorPrompt(event, registrationCount, historicalData = []) {
  const daysUntil = event.start_date 
    ? Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24)) 
    : 'unknown';

  return `${SAUDI_CONTEXT.COMPACT}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

EVENT ATTENDANCE PREDICTION FOR MoMAH:

EVENT DETAILS:
- Title: ${event.title_en || event.title_ar || 'Event'}
- Type: ${event.event_type || 'general'}
- Current Registrations: ${registrationCount}
- Maximum Capacity: ${event.max_participants || 'unlimited'}
- Days Until Event: ${daysUntil}
- Event Mode: ${event.event_mode || 'in-person'}
- Location: ${event.location || 'TBD'}

${historicalData.length > 0 ? `
HISTORICAL CONTEXT:
- Average attendance rate for similar events: ${Math.round(historicalData.reduce((acc, e) => acc + (e.attendance_rate || 75), 0) / historicalData.length)}%
- Similar event count analyzed: ${historicalData.length}
` : 'No historical data available - use industry benchmarks for government events.'}

PREDICT AND ANALYZE:

1. PREDICTED ATTENDANCE:
   - Final expected attendee count
   - Attendance rate percentage
   - Confidence level (high/medium/low)
   - Trend direction (up/down/stable)

2. INFLUENCING FACTORS:
   - List key factors affecting attendance (positive/negative/neutral)
   - Consider Saudi work week, holidays, competing events

3. RECOMMENDATIONS:
   - Actions to improve attendance (bilingual)
   - Timing for reminder communications
   - Capacity adjustment suggestions if needed

4. RISK ASSESSMENT:
   - Risk level for low attendance
   - Estimated no-show count

CRITICAL: All recommendations must be bilingual (English + Arabic).`;
}

/**
 * Attendance predictor response schema
 */
export const attendancePredictorSchema = {
  type: 'object',
  properties: {
    predicted_attendance: { type: 'number', description: 'Expected final attendee count' },
    attendance_rate: scoreField(0, 100),
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    trend: { type: 'string', enum: ['up', 'down', 'stable'] },
    factors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...flatBilingualFields('factor', 'Factor description'),
          impact: { type: 'string', enum: ['positive', 'negative', 'neutral'] }
        },
        required: ['factor_en', 'factor_ar', 'impact']
      }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...flatBilingualFields('recommendation', 'Recommendation text'),
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        },
        required: ['recommendation_en', 'recommendation_ar']
      }
    },
    risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    no_show_estimate: { type: 'number' }
  },
  required: ['predicted_attendance', 'attendance_rate', 'confidence', 'trend', 'factors', 'recommendations', 'risk_level']
};

export default { getAttendancePredictorPrompt, attendancePredictorSchema };
