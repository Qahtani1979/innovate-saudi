/**
 * Innovation Framing Generator AI Prompt
 * Transforms problems into innovation opportunities
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generates prompt for innovation framing
 * @param {Object} challenge - Challenge data
 * @returns {string} Formatted prompt
 */
export function getInnovationFramingPrompt(challenge) {
  return `${SAUDI_CONTEXT.INNOVATION}

Transform this municipal PROBLEM into innovation OPPORTUNITIES.

CHALLENGE:
- English: ${challenge.title_en}
- Arabic: ${challenge.title_ar || 'Not provided'}
- Description EN: ${challenge.description_en || ''}
- Description AR: ${challenge.description_ar || ''}
- Problem Statement EN: ${challenge.problem_statement_en || ''}
- Problem Statement AR: ${challenge.problem_statement_ar || ''}
- Desired Outcome EN: ${challenge.desired_outcome_en || ''}
- Desired Outcome AR: ${challenge.desired_outcome_ar || ''}

${LANGUAGE_REQUIREMENTS}

Generate innovation framing:

1. HMW QUESTIONS (5): "How Might We..." reframing problems as opportunities
   - Focus on citizen-centric outcomes
   - Enable technology adoption
   - Drive sustainable change

2. WHAT IF SCENARIOS (5): "What if..." exploring future possibilities
   - Bold transformative visions
   - Technology-enabled futures
   - Cross-sector collaboration

3. GUIDING QUESTIONS:
   - For Startups (4): Market opportunity, scalability, business model, customer value
   - For Researchers (4): Technical challenges, research gaps, validation needs, collaboration
   - Technology Opportunities (5): Specific tech domains (AI, IoT, sensors, data analytics, etc)

ALL content must be BILINGUAL (English AND Arabic), ACTIONABLE, and INSPIRING.`;
}

/**
 * JSON schema for innovation framing response
 */
export const innovationFramingSchema = {
  type: 'object',
  properties: {
    hmw_questions: {
      type: 'array',
      items: { 
        type: 'object',
        properties: flatBilingualFields('question'),
        required: ['en', 'ar']
      },
      description: 'How Might We questions'
    },
    what_if_scenarios: {
      type: 'array',
      items: { 
        type: 'object',
        properties: flatBilingualFields('scenario'),
        required: ['en', 'ar']
      },
      description: 'What If scenarios'
    },
    guiding_questions: {
      type: 'object',
      properties: {
        for_startups: {
          type: 'array',
          items: { 
            type: 'object',
            properties: flatBilingualFields('question'),
            required: ['en', 'ar']
          }
        },
        for_researchers: {
          type: 'array',
          items: { 
            type: 'object',
            properties: flatBilingualFields('question'),
            required: ['en', 'ar']
          }
        },
        technology_opportunities: {
          type: 'array',
          items: { 
            type: 'object',
            properties: flatBilingualFields('opportunity'),
            required: ['en', 'ar']
          }
        }
      },
      required: ['for_startups', 'for_researchers', 'technology_opportunities']
    }
  },
  required: ['hmw_questions', 'what_if_scenarios', 'guiding_questions']
};

/**
 * Generates prompt for translation
 */
export function getTranslationPrompt(text, targetLang) {
  return `Translate to ${targetLang === 'ar' ? 'Arabic' : 'English'}:
${text}

Provide natural, contextually appropriate translation.`;
}

export const translationSchema = {
  type: 'object',
  properties: {
    translation: { type: 'string' }
  },
  required: ['translation']
};

export default { 
  getInnovationFramingPrompt, 
  innovationFramingSchema,
  getTranslationPrompt,
  translationSchema
};
