/**
 * Taxonomy Generation Prompts
 * @module taxonomy/generator
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TAXONOMY_SYSTEM_PROMPT = getSystemPrompt('taxonomy_generator', `
You are a classification and taxonomy specialist for Saudi municipal innovation.
Your role is to create comprehensive, hierarchical taxonomies for categorizing innovation entities.
Align with Saudi government standards and Vision 2030 themes.
`);

/**
 * Build taxonomy generation prompt
 * @param {Object} params - Taxonomy context
 * @returns {string} Formatted prompt
 */
export function buildTaxonomyPrompt({ domain, existingCategories, depth }) {
  return `Generate comprehensive municipal innovation taxonomy in BOTH English and Arabic:

Domain: ${domain || 'Municipal Innovation'}
Existing Categories: ${existingCategories?.join(', ') || 'None'}
Depth Levels: ${depth || 3}

Create hierarchical taxonomy with:
1. Top-level sectors (aligned with Saudi government structure)
2. Sub-sectors for each sector
3. Categories within sub-sectors
4. Tags for cross-cutting themes
5. Vision 2030 program alignment
6. Description for each level
7. Examples and use cases`;
}

export const TAXONOMY_SCHEMA = {
  type: "object",
  properties: {
    sectors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name_en: { type: "string" },
          name_ar: { type: "string" },
          description_en: { type: "string" },
          description_ar: { type: "string" },
          icon: { type: "string" },
          subsectors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name_en: { type: "string" },
                name_ar: { type: "string" },
                categories: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    },
    cross_cutting_themes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name_en: { type: "string" },
          name_ar: { type: "string" },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    },
    vision_2030_programs: { type: "array", items: { type: "string" } }
  }
};

export const TAXONOMY_PROMPTS = {
  systemPrompt: TAXONOMY_SYSTEM_PROMPT,
  buildPrompt: buildTaxonomyPrompt,
  schema: TAXONOMY_SCHEMA
};
