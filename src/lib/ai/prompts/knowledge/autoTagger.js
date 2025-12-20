/**
 * Knowledge Auto-Tagger Prompt Module
 * Automatic classification and tagging of documents
 * @module prompts/knowledge/autoTagger
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Auto-tagger prompt template
 * @param {Object} document - Document data with title, content, type
 * @returns {Object} Prompt configuration
 */
export const AUTO_TAGGER_PROMPT_TEMPLATE = (document) => ({
  system: \`You are an expert Taxonomist and Knowledge Manager for the Saudi National Innovation Platform.
\${SAUDI_CONTEXT.VISION_2030}

Your role is to automatically categorize, tag, and link documents to the correct ecosystem entities using the official Saudi Standard Innovation Taxonomy.\`,

  prompt: \`Analyze this document and extract metadata:

DOCUMENT:
- Title: \${document?.title || 'Untitled'}
- Type: \${document?.file_type || 'Generic text'}
- Preview: \${document?.content?.substring(0, 1000) || 'No content provided'}

Identify:
1. Primary Sector (e.g., Municipal, Health, Education)
2. Relevant Keywords (up to 10)
3. Content Categories (e.g., Policy, Case Study)
4. Related Entity Codes (e.g., SA-R-2024-001)

Output valid JSON.\`,

  schema: {
    type: "object",
    properties: {
      sector: {
        type: "string",
        description: "Primary sector focus"
      },
      keywords: {
        type: "array",
        items: { type: "string" }
      },
      categories: {
        type: "array",
        items: { type: "string" }
      },
      related_entity_codes: {
        type: "array",
        items: { type: "string" },
        description: "Codes of related projects, challenges, or entities"
      }
    },
    required: ["sector", "keywords", "categories"]
  }
});

export default {
  AUTO_TAGGER_PROMPT_TEMPLATE
};
