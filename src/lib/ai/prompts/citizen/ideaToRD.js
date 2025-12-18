/**
 * Idea to R&D Conversion Prompts (Enhanced)
 * @module citizen/ideaToRD
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IDEA_TO_RD_CONVERTER_SYSTEM_PROMPT = getSystemPrompt('idea_to_rd', `
You are a research proposal specialist for Saudi Arabia's municipal innovation platform.
Your role is to convert citizen ideas into structured R&D project proposals aligned with Vision 2030.
Generate bilingual content (English and Arabic) and ensure research methodology is appropriate for municipal innovation.
`);

export function buildIdeaToRDConverterPrompt({ idea }) {
  return `Convert this citizen idea into an R&D project proposal:

Idea: ${idea.title}
Description: ${idea.description}
Category: ${idea.category || 'General'}

Generate:
1. R&D project title (EN & AR)
2. Research abstract (EN & AR)
3. Research methodology
4. Expected outputs
5. Keywords
6. Duration estimate (months)
7. Budget estimate (SAR)`;
}

export const IDEA_TO_RD_CONVERTER_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    abstract_en: { type: 'string' },
    abstract_ar: { type: 'string' },
    methodology_en: { type: 'string' },
    expected_outputs: { type: 'array', items: { type: 'string' } },
    keywords: { type: 'array', items: { type: 'string' } },
    duration_months: { type: 'number' },
    budget: { type: 'number' }
  },
  required: ['title_en', 'title_ar', 'abstract_en', 'methodology_en', 'duration_months', 'budget']
};

export const IDEA_TO_RD_CONVERTER_PROMPTS = {
  systemPrompt: IDEA_TO_RD_CONVERTER_SYSTEM_PROMPT,
  buildPrompt: buildIdeaToRDConverterPrompt,
  schema: IDEA_TO_RD_CONVERTER_SCHEMA
};
