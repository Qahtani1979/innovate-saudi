/**
 * Program-Event Correlator AI Prompt
 * Analyzes relationships between programs and events
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields, scoreField } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generate program-event correlation prompt
 * @param {Array} programs - List of programs
 * @param {Array} events - List of events
 * @param {string} language - Current language
 * @returns {string} Complete prompt
 */
export function getProgramEventCorrelatorPrompt(programs, events, language = 'en') {
  const programSummary = programs.slice(0, 10).map(p => ({
    id: p.id,
    name: language === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar),
    type: p.program_type,
    status: p.status,
    has_events: (p.events || []).length > 0
  }));

  const eventSummary = events.slice(0, 10).map(e => ({
    id: e.id,
    title: language === 'ar' ? (e.title_ar || e.title_en) : (e.title_en || e.title_ar),
    type: e.event_type,
    program_id: e.program_id,
    status: e.status
  }));

  return `${SAUDI_CONTEXT.FULL}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

PROGRAM-EVENT CORRELATION ANALYSIS FOR MoMAH:

ANALYZING PORTFOLIO:
- Total Programs: ${programs.length}
- Total Events: ${events.length}
- Programs with Events: ${programs.filter(p => (p.events || []).length > 0).length}
- Standalone Events: ${events.filter(e => !e.program_id).length}

PROGRAMS SAMPLE (${programSummary.length}):
${JSON.stringify(programSummary, null, 2)}

EVENTS SAMPLE (${eventSummary.length}):
${JSON.stringify(eventSummary, null, 2)}

ANALYZE AND IDENTIFY:

1. PROGRAMS WITHOUT EVENTS:
   - Which programs lack supporting events?
   - Suggest 2-3 event types for each (workshop, demo, training, etc.)
   - Recommended timing within program lifecycle

2. EVENT GAPS:
   - Audience coverage gaps
   - Timing/scheduling gaps
   - Topic/theme gaps
   - Geographic coverage gaps

3. SYNERGY OPPORTUNITIES:
   - Programs that could share events
   - Cross-program collaboration possibilities
   - Joint event recommendations

4. OVERALL HEALTH SCORE:
   - Program-event alignment score (0-100)
   - Health status assessment
   - Executive summary

CRITICAL: All text must be bilingual. Focus on MoMAH innovation ecosystem optimization.`;
}

/**
 * Program-event correlator response schema
 */
export const programEventCorrelatorSchema = {
  type: 'object',
  properties: {
    programs_without_events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          program_id: { type: 'string' },
          ...flatBilingualFields('program_name', 'Program name'),
          suggested_events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                ...flatBilingualFields('topic', 'Event topic'),
                timing: { type: 'string' }
              }
            }
          }
        }
      }
    },
    event_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gap_type: { type: 'string', enum: ['audience', 'timing', 'topic', 'geographic'] },
          ...flatBilingualFields('description', 'Gap description'),
          ...flatBilingualFields('recommendation', 'How to address the gap')
        },
        required: ['gap_type', 'description_en', 'description_ar']
      }
    },
    synergy_opportunities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          programs: { type: 'array', items: { type: 'string' } },
          ...flatBilingualFields('opportunity', 'Synergy description'),
          impact: { type: 'string', enum: ['high', 'medium', 'low'] }
        },
        required: ['programs', 'opportunity_en', 'opportunity_ar', 'impact']
      }
    },
    overall_health: {
      type: 'object',
      properties: {
        score: scoreField(0, 100),
        status: { type: 'string', enum: ['good', 'needs_attention', 'critical'] },
        ...flatBilingualFields('summary', 'Executive summary')
      },
      required: ['score', 'status', 'summary_en', 'summary_ar']
    }
  },
  required: ['programs_without_events', 'event_gaps', 'synergy_opportunities', 'overall_health']
};

export default { getProgramEventCorrelatorPrompt, programEventCorrelatorSchema };
