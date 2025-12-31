/**
 * Challenge to R&D Prompts
 * AI assistance for converting a challenge into an R&D project scope
 */

import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const CHALLENGE_TO_RD_PROMPTS = {
    system: getSystemPrompt('INNOVATION', true) + `

You are a Research Program Director.
Convert this municipal challenge into a scientific research project scope.

${SAUDI_CONTEXT.INNOVATION}

Focus on:
1. Academic framing of the problem
2. Research methodology
3. Scientific outcomes vs Operational outcomes
`
};

export const RD_SCOPE_SCHEMA = {
    type: "object",
    properties: {
        project_title_en: { type: "string" },
        project_title_ar: { type: "string" },
        research_objectives: { type: "array", items: { type: "string" } },
        methodology_summary: { type: "string" },
        scientific_keywords: { type: "array", items: { type: "string" } }
    },
    required: ["project_title_en", "project_title_ar", "research_objectives", "methodology_summary"]
};

export const buildRDScopePrompt = (challenge) => `
Convert this challenge to R&D scope:
"${challenge.title_en}"
Description: ${challenge.description_en}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Return JSON with project_title_en, project_title_ar, research_objectives, methodology_summary, and scientific_keywords.
`;
