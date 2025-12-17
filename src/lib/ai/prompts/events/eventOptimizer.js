/**
 * Event Optimizer AI Prompt
 * Provides optimization suggestions for events
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields, scoreField } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generate event optimization prompt
 * @param {Object} eventData - Event details
 * @param {Object} relatedEntities - Related context
 * @returns {string} Complete prompt
 */
export function getEventOptimizerPrompt(eventData, relatedEntities = {}) {
  return `${SAUDI_CONTEXT.FULL}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

EVENT OPTIMIZATION ANALYSIS FOR MoMAH INNOVATION PLATFORM:

CURRENT EVENT DETAILS:
- Title: ${eventData.title_en || eventData.title_ar || 'New Event'}
- Type: ${eventData.event_type || 'Not specified'}
- Description: ${eventData.description_en || eventData.description_ar || 'No description'}
- Proposed Date: ${eventData.start_date || 'Not set'}
- Location: ${eventData.location || 'Not specified'}
- Event Mode: ${eventData.event_mode || 'in-person'}
- Target Audience: ${eventData.target_audience || 'General government innovation stakeholders'}
- Current Capacity: ${eventData.max_participants || 'Not set'}

${relatedEntities.program ? `
LINKED PROGRAM: ${relatedEntities.program.name_en || relatedEntities.program.name_ar}
Program Type: ${relatedEntities.program.program_type}
` : ''}

${relatedEntities.similarEvents ? `
SIMILAR RECENT EVENTS (for context):
${relatedEntities.similarEvents.slice(0, 3).map(e => `- ${e.title_en}: ${e.event_type}`).join('\n')}
` : ''}

PROVIDE OPTIMIZATION SUGGESTIONS:

1. OPTIMAL TIMING:
   - Best day of week for government innovation events
   - Optimal time slot considering Saudi work hours
   - Reasoning based on MoMAH stakeholder availability

2. DESCRIPTION ENHANCEMENT:
   - Enhanced English description (professional, Vision 2030 aligned)
   - Enhanced Arabic description (formal MSA, culturally appropriate)

3. SUGGESTED TAGS:
   - 5-8 relevant tags for discoverability
   - Include both sector and innovation-focused tags

4. EVENT TYPE RECOMMENDATION:
   - Most suitable event format (workshop, webinar, conference, meetup, training)
   - Reasoning based on objectives and audience

5. CAPACITY SUGGESTION:
   - Recommended participant count
   - Based on event type and topic complexity

CRITICAL: All text must be bilingual. Focus on government innovation context.`;
}

/**
 * Event optimizer response schema
 */
export const eventOptimizerSchema = {
  type: 'object',
  properties: {
    optimal_timing: {
      type: 'object',
      properties: {
        suggested_day_en: { type: 'string' },
        suggested_day_ar: { type: 'string' },
        suggested_time: { type: 'string', description: 'Time in 24h format range' },
        ...flatBilingualFields('reasoning', 'Why this timing is optimal')
      },
      required: ['suggested_day_en', 'suggested_day_ar', 'suggested_time']
    },
    description_enhancement: {
      type: 'object',
      properties: {
        en: { type: 'string', description: 'Enhanced English description (max 200 words)' },
        ar: { type: 'string', description: 'Enhanced Arabic description (formal MSA)' }
      },
      required: ['en', 'ar']
    },
    suggested_tags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 5,
      maxItems: 8
    },
    event_type_recommendation: {
      type: 'object',
      properties: {
        recommended: { type: 'string', enum: ['workshop', 'webinar', 'conference', 'meetup', 'training', 'hackathon', 'demo_day'] },
        ...flatBilingualFields('reasoning', 'Why this format fits')
      },
      required: ['recommended', 'reasoning_en', 'reasoning_ar']
    },
    capacity_suggestion: {
      type: 'object',
      properties: {
        recommended: { type: 'number' },
        ...flatBilingualFields('reasoning', 'Capacity recommendation rationale')
      },
      required: ['recommended', 'reasoning_en', 'reasoning_ar']
    }
  },
  required: ['optimal_timing', 'description_enhancement', 'suggested_tags', 'event_type_recommendation', 'capacity_suggestion']
};

export default { getEventOptimizerPrompt, eventOptimizerSchema };
