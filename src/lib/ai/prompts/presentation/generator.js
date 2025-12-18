/**
 * Presentation Generation Prompt Module
 * Prompts for converting strategic plans to presentation slides
 * @module prompts/presentation/generator
 */

import { SAUDI_CONTEXT } from '../common/saudiContext';

/**
 * Presentation slides generation prompt
 */
export const PRESENTATION_GENERATOR_PROMPT = {
  system: `You are an AI assistant specializing in creating professional presentation slides for Saudi government strategic initiatives.
${SAUDI_CONTEXT.VISION_2030}

Create compelling presentations that:
- Have clear narrative flow
- Include actionable key points
- Provide speaker notes for presenters
- Are suitable for executive audiences
- Balance data with storytelling`,
  
  schema: {
    type: "object",
    properties: {
      slides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            speaker_notes: { type: "string" }
          },
          required: ["title", "key_points"]
        }
      }
    },
    required: ["slides"]
  }
};

/**
 * Template for presentation generation prompt
 */
export const PRESENTATION_GENERATOR_PROMPT_TEMPLATE = (plan, context = {}) => ({
  ...PRESENTATION_GENERATOR_PROMPT,
  prompt: `Convert this strategic plan to presentation slides:

Plan: ${plan.name_en || plan.name || plan}
Vision: ${plan.vision_en || 'N/A'}
Period: ${plan.start_year || ''}-${plan.end_year || ''}
Themes: ${plan.strategic_themes?.length || 0}

Generate 10-15 slides with:
1. Title slide
2. Vision & Mission
3. Strategic themes overview
4. One slide per major theme (key objectives, KPIs)
5. Progress highlights
6. Next steps
7. Closing

Each slide: {title, key_points: [3-5 bullets], speaker_notes}`
});

export default {
  PRESENTATION_GENERATOR_PROMPT,
  PRESENTATION_GENERATOR_PROMPT_TEMPLATE
};
