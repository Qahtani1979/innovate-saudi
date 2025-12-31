/**
 * Impact Storytelling Engine Prompt Module
 * AI-powered impact story generation for innovation initiatives
 * @module prompts/storytelling/impactEngine
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

/**
 * Schema for impact story response
 */
export const IMPACT_STORY_SCHEMA = {
  type: 'object',
  properties: {
    story_title_en: { type: 'string', description: 'English story title' },
    story_title_ar: { type: 'string', description: 'Arabic story title' },
    hook_en: { type: 'string', description: 'English attention-grabbing hook' },
    hook_ar: { type: 'string', description: 'Arabic hook' },
    challenge_narrative_en: { type: 'string', description: 'English challenge description' },
    challenge_narrative_ar: { type: 'string', description: 'Arabic challenge narrative' },
    solution_narrative_en: { type: 'string', description: 'English solution description' },
    solution_narrative_ar: { type: 'string', description: 'Arabic solution narrative' },
    impact_narrative_en: { type: 'string', description: 'English impact description' },
    impact_narrative_ar: { type: 'string', description: 'Arabic impact narrative' },
    key_quotes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote_en: { type: 'string' },
          quote_ar: { type: 'string' },
          attribution: { type: 'string' }
        },
        required: ['quote_en', 'attribution']
      }
    },
    visual_suggestions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Suggestions for visuals and media'
    },
    call_to_action_en: { type: 'string', description: 'English call to action' },
    call_to_action_ar: { type: 'string', description: 'Arabic call to action' },
    social_media_snippets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['twitter', 'linkedin', 'instagram', 'facebook'] },
          content_en: { type: 'string' },
          content_ar: { type: 'string' }
        },
        required: ['platform', 'content_en']
      }
    }
  },
  required: ['story_title_en', 'hook_en', 'challenge_narrative_en', 'solution_narrative_en', 'impact_narrative_en', 'call_to_action_en']
};

/**
 * Impact story prompt template
 * @param {Object} context - Story context
 * @returns {string} Formatted prompt
 */
export function IMPACT_STORY_PROMPT_TEMPLATE(context) {
  const { entityType, entityTitle, description, sector, metrics, stakeholders, audience } = context;
  
  return `Create a compelling impact story for this ${entityType}:

${SAUDI_CONTEXT.FULL}

ENTITY DETAILS:
Title: ${entityTitle}
Description: ${description}
Sector: ${sector}

IMPACT METRICS:
${JSON.stringify(metrics, null, 2)}

STAKEHOLDERS:
${stakeholders || 'Various municipal and national stakeholders'}

TARGET AUDIENCE: ${audience || 'General public, government officials, innovation community'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

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
