/**
 * Impact Storytelling Engine Prompt Module
 * AI-powered impact story generation for innovation initiatives
 * @module prompts/storytelling/impactEngine
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Schema for impact story response
 */
export const IMPACT_STORY_SCHEMA = {
  type: 'object',
  properties: {
    story_title_en: { type: 'string' },
    story_title_ar: { type: 'string' },
    hook_en: { type: 'string' },
    hook_ar: { type: 'string' },
    challenge_narrative_en: { type: 'string' },
    challenge_narrative_ar: { type: 'string' },
    solution_narrative_en: { type: 'string' },
    solution_narrative_ar: { type: 'string' },
    impact_narrative_en: { type: 'string' },
    impact_narrative_ar: { type: 'string' },
    key_quotes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote_en: { type: 'string' },
          quote_ar: { type: 'string' },
          attribution: { type: 'string' }
        }
      }
    },
    visual_suggestions: {
      type: 'array',
      items: { type: 'string' }
    },
    call_to_action_en: { type: 'string' },
    call_to_action_ar: { type: 'string' },
    social_media_snippets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          content_en: { type: 'string' },
          content_ar: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Impact story prompt template
 * @param {Object} context - Story context
 * @returns {string} Formatted prompt
 */
export function IMPACT_STORY_PROMPT_TEMPLATE(context) {
  const { entityType, entityTitle, description, sector, metrics, stakeholders, audience } = context;
  
  return `Create a compelling impact story for this ${entityType}:

${SAUDI_CONTEXT}

ENTITY DETAILS:
Title: ${entityTitle}
Description: ${description}
Sector: ${sector}

IMPACT METRICS:
${JSON.stringify(metrics, null, 2)}

STAKEHOLDERS:
${stakeholders || 'Various municipal and national stakeholders'}

TARGET AUDIENCE: ${audience || 'General public, government officials, innovation community'}

Generate a compelling bilingual impact story that:
1. Opens with an engaging hook that captures attention
2. Describes the challenge/problem being addressed
3. Explains the innovative solution implemented
4. Highlights measurable impact and outcomes
5. Includes suggested quotes (can be paraphrased)
6. Provides visual/media suggestions
7. Ends with a clear call to action
8. Creates ready-to-use social media snippets

The story should align with Vision 2030 messaging and resonate with Saudi audiences.`;
}

/**
 * Impact story system prompt
 */
export const IMPACT_STORY_SYSTEM_PROMPT = `You are an expert storyteller specializing in government innovation and public sector transformation in Saudi Arabia.

Your role is to transform technical project data into compelling human-interest stories that:
- Resonate with diverse audiences (citizens, officials, investors)
- Highlight real-world impact on communities
- Align with Vision 2030 narrative and national pride
- Use emotionally engaging language while remaining factual
- Work effectively in both English and Arabic

Create stories that inspire action and build support for innovation initiatives.`;

export default {
  IMPACT_STORY_PROMPT_TEMPLATE,
  IMPACT_STORY_SCHEMA,
  IMPACT_STORY_SYSTEM_PROMPT
};
