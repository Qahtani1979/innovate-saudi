/**
 * Sandbox Create Wizard Prompt
 * Generates complete sandbox design with AI
 * @version 1.0.0
 */

import { createBilingualSchema } from '../../bilingualSchemaBuilder';
import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generate prompt for sandbox design
 * @param {Object} params - Design parameters
 * @param {Object} params.formData - Current form data
 * @returns {string} Formatted prompt
 */
export function getSandboxDesignPrompt({ formData }) {
  return `${SAUDI_CONTEXT.FULL}

You are an AI system designing regulatory sandboxes for Saudi municipal innovation.

Design a comprehensive regulatory sandbox for this context:

TYPE: ${formData.sandbox_type || 'regulatory'}
SECTOR: ${formData.sector || 'General Municipal Innovation'}
BASIC DESCRIPTION: ${formData.description_en || 'N/A'}

GENERATE COMPREHENSIVE BILINGUAL SANDBOX DESIGN:

1. PROFESSIONAL NAME
   - English name
   - Arabic name (النسخة العربية)

2. DETAILED DESCRIPTION (150+ words each)
   - English description
   - Arabic description

3. REGULATORY FRAMEWORK (5-8 items)
   Each item bilingual with en/ar properties

4. SAFETY PROTOCOLS (6-10 items)
   Each item bilingual with en/ar properties

5. ENTRY CRITERIA (5-7 items)
   Requirements to enter sandbox, bilingual

6. EXIT CRITERIA (5-7 items)
   Conditions for successful graduation, bilingual

Ensure all content aligns with Saudi Vision 2030 and municipal innovation goals.`;
}

/**
 * Schema for sandbox design
 */
export const sandboxDesignSchema = createBilingualSchema({
  name: "sandbox_design",
  description: "Complete sandbox design with bilingual content",
  properties: {
    name_en: { type: "string", description: "Sandbox name in English" },
    name_ar: { type: "string", description: "Sandbox name in Arabic" },
    description_en: { type: "string", description: "Detailed description in English" },
    description_ar: { type: "string", description: "Detailed description in Arabic" },
    regulatory_framework: {
      type: "array",
      description: "Regulatory framework items",
      items: {
        type: "object",
        properties: {
          en: { type: "string", description: "English text" },
          ar: { type: "string", description: "Arabic text" }
        },
        required: ["en", "ar"]
      }
    },
    safety_protocols: {
      type: "array",
      description: "Safety protocol items",
      items: {
        type: "object",
        properties: {
          en: { type: "string", description: "English text" },
          ar: { type: "string", description: "Arabic text" }
        },
        required: ["en", "ar"]
      }
    },
    entry_criteria: {
      type: "array",
      description: "Entry criteria items",
      items: {
        type: "object",
        properties: {
          en: { type: "string", description: "English text" },
          ar: { type: "string", description: "Arabic text" }
        },
        required: ["en", "ar"]
      }
    },
    exit_criteria: {
      type: "array",
      description: "Exit criteria items",
      items: {
        type: "object",
        properties: {
          en: { type: "string", description: "English text" },
          ar: { type: "string", description: "Arabic text" }
        },
        required: ["en", "ar"]
      }
    }
  },
  required: ["name_en", "name_ar", "description_en", "description_ar", "regulatory_framework", "safety_protocols", "entry_criteria", "exit_criteria"]
});
