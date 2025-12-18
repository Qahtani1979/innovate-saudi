/**
 * R&D Call Creation Prompts
 * AI-assisted drafting for research funding calls
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const RD_CALL_CREATE_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are an expert in Saudi Arabian research and development funding. Generate comprehensive, professional content for R&D calls aligned with Vision 2030 goals.`;

export const RD_CALL_CREATE_PROMPT_TEMPLATE = (formData = {}) => `Generate a complete R&D call for Saudi municipal innovation based on:
Title: ${formData.title_en || ''}
Call Type: ${formData.call_type || 'open_call'}

Create comprehensive bilingual content for a professional research funding call. Include:
1. Arabic translation of the title
2. Catchy taglines in both languages
3. Detailed professional descriptions (500+ words each) explaining the call's purpose, scope, and importance
4. Clear objectives in both languages
5. Arabic objectives translation
6. 5-7 eligibility criteria for applicants
7. 5-7 expected outcomes/deliverables
8. 3-5 research themes with descriptions
9. 4-5 evaluation criteria with weights (must sum to 100)
10. 3-5 submission requirements

Make the content specific to Saudi Arabia's municipal innovation context and Vision 2030 goals.`;

export const RD_CALL_CREATE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title_ar: { type: 'string' },
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    objectives_en: { type: 'string' },
    objectives_ar: { type: 'string' },
    eligibility_criteria: { type: 'array', items: { type: 'string' } },
    expected_outcomes: { type: 'array', items: { type: 'string' } },
    research_themes: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          theme: { type: 'string' },
          description: { type: 'string' }
        }
      } 
    },
    evaluation_criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          description: { type: 'string' },
          weight: { type: 'number' }
        }
      }
    },
    submission_requirements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          requirement: { type: 'string' },
          description: { type: 'string' },
          mandatory: { type: 'boolean' }
        }
      }
    },
    focus_areas: { type: 'array', items: { type: 'string' } }
  }
};

export default {
  RD_CALL_CREATE_SYSTEM_PROMPT,
  RD_CALL_CREATE_PROMPT_TEMPLATE,
  RD_CALL_CREATE_RESPONSE_SCHEMA
};
