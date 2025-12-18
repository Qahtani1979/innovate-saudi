/**
 * Content Auto-Tagger Prompts
 * @module knowledge/autoTagger
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const AUTO_TAGGER_SYSTEM_PROMPT = getSystemPrompt('auto_tagger', `
You are a content metadata specialist for Saudi Arabia's municipal innovation knowledge base.
Your role is to automatically extract and suggest tags, keywords, and categories for documents.
Consider sector relevance, entity relationships, and thematic classification.
`);

/**
 * Build auto-tagging prompt
 * @param {Object} params - Document data
 * @returns {string} Formatted prompt
 */
export function buildAutoTaggerPrompt({ document }) {
  return `Analyze document and suggest metadata tags:

TITLE: ${document?.title_en || document?.title || 'Unknown'}
CONTENT: ${(document?.content_en || document?.content || '').substring(0, 500)}
TYPE: ${document?.type || 'general'}

Extract:
1. Primary sector (urban_design, transport, environment, etc.)
2. Keywords (5-10 relevant terms)
3. Categories (best_practice, case_study, guide, template, etc.)
4. Related entities (mention Challenge codes, Pilot codes, municipalities)
5. Topics/themes`;
}

export const AUTO_TAGGER_SCHEMA = {
  type: "object",
  properties: {
    sector: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    categories: { type: "array", items: { type: "string" } },
    related_entity_codes: { type: "array", items: { type: "string" } },
    themes: { type: "array", items: { type: "string" } }
  },
  required: ["sector", "keywords", "categories"]
};

export const AUTO_TAGGER_PROMPTS = {
  systemPrompt: AUTO_TAGGER_SYSTEM_PROMPT,
  buildPrompt: buildAutoTaggerPrompt,
  schema: AUTO_TAGGER_SCHEMA
};
