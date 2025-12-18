/**
 * Branding Optimizer AI Prompts
 * Prompts for analyzing and optimizing platform branding
 * @module ai/prompts/branding/optimizer
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Branding Optimization Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const BRANDING_OPTIMIZATION_PROMPT_TEMPLATE = ({
  platformNameEn,
  platformNameAr,
  taglineEn,
  taglineAr,
  primaryColor,
  secondaryColor,
  accentColor,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Analyze this platform branding and suggest improvements:

Platform: ${platformNameEn} / ${platformNameAr}
Tagline: ${taglineEn} / ${taglineAr}
Colors: Primary ${primaryColor}, Secondary ${secondaryColor}, Accent ${accentColor || 'N/A'}

Provide bilingual recommendations for:
1. Brand positioning improvements - aligned with Saudi Vision 2030
2. Color psychology alignment with innovation and government trust
3. Tagline alternatives that resonate with Saudi municipal context
4. Visual identity suggestions for professional government platform`,
  system: `You are a Saudi brand strategy expert specializing in government and innovation platforms. Provide actionable, bilingual recommendations that align with Vision 2030 and Saudi cultural values.`,
  schema: {
    type: 'object',
    properties: {
      positioning: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      },
      color_recommendations: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            color: { type: 'string' }, 
            reason_en: { type: 'string' }, 
            reason_ar: { type: 'string' } 
          } 
        } 
      },
      tagline_alternatives: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      visual_suggestions: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      }
    },
    required: ['positioning', 'color_recommendations', 'tagline_alternatives', 'visual_suggestions']
  }
});

export default {
  BRANDING_OPTIMIZATION_PROMPT_TEMPLATE
};
