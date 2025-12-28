/**
 * Strategic Narrative Prompts
 * AI assistance for crafting strategic narratives
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const NARRATIVE_GENERATOR_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert strategic communications specialist.
Your goal is to craft compelling strategic narratives.
Focus on:
- Clarity of Vision
- Emotional Responance
- Call to Action
`;

export const narrativeGeneratorSchema = {
    type: "object",
    properties: {
        narrative_title: { type: "string" },
        core_message: { type: "string" },
        key_themes: { type: "array", items: { type: "string" } },
        narrative_body_en: { type: "string" },
        narrative_body_ar: { type: "string" }
    }
};

export const buildNarrativeGeneratorPrompt = (context) => `
Draft a strategic narrative for:

Vision: ${context.vision || 'Not specified'}
Audience: ${context.audience || 'General Public'}

Requirements:
1. Create a compelling story that connects the vision to the audience.
2. Outline key themes and a core message.

Response Format: JSON
`;
