/**
 * Strategy Wizard Content Generation Prompts
 * @module strategy/wizardContent
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const STRATEGY_WIZARD_CONTENT_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are an expert in Saudi Arabian strategic planning and Vision 2030. Generate professional content in both English and Arabic. Use formal language appropriate for government documents.`;

/**
 * Build wizard content generation prompt
 * @param {Object} params - Wizard step and context data
 * @returns {string} Formatted prompt
 */
export function buildWizardContentPrompt({ step, context, existingData }) {
  const stepPrompts = {
    context: `Generate strategic plan foundation content based on:
NAME: ${context?.name_en || existingData?.name_en || 'Municipal Strategic Plan'}
MUNICIPALITY: ${context?.municipality_name || 'Saudi Municipality'}
SECTOR FOCUS: ${(context?.target_sectors || []).join(', ') || 'General'}

Generate:
- Vision statement (English and Arabic)
- Mission statement (English and Arabic)
- Description (English and Arabic)
- Suggested duration and budget range
- Target sectors and themes`,
    
    values: `Generate core values for the strategic plan:
PLAN: ${existingData?.name_en || 'Strategic Plan'}
VISION: ${existingData?.vision_en || ''}

Generate 4-6 core values with:
- Name (English and Arabic)
- Description
- Icon suggestion`,

    objectives: `Generate strategic objectives aligned with:
VISION: ${existingData?.vision_en || ''}
MISSION: ${existingData?.mission_en || ''}
THEMES: ${(existingData?.strategic_themes || []).join(', ') || ''}

Generate 4-6 strategic objectives with:
- Title (English and Arabic)
- Description
- Target metrics
- Timeline`,

    kpis: `Generate KPIs for strategic objectives:
OBJECTIVES: ${JSON.stringify(existingData?.objectives || [])}

Generate 2-3 KPIs per objective with:
- Name (English and Arabic)
- Unit of measurement
- Baseline and target values
- Frequency of measurement`
  };

  return stepPrompts[step] || `Generate content for ${step} step of strategic planning wizard.`;
}

export const STRATEGY_WIZARD_CONTENT_SCHEMA = {
  context: {
    type: 'object',
    properties: {
      vision_en: { type: 'string' },
      vision_ar: { type: 'string' },
      mission_en: { type: 'string' },
      mission_ar: { type: 'string' },
      description_en: { type: 'string' },
      description_ar: { type: 'string' },
      start_year: { type: 'number' },
      end_year: { type: 'number' },
      budget_range: { type: 'string' },
      target_sectors: { type: 'array', items: { type: 'string' } },
      strategic_themes: { type: 'array', items: { type: 'string' } }
    }
  },
  values: {
    type: 'object',
    properties: {
      core_values: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            name_ar: { type: 'string' },
            description_en: { type: 'string' },
            icon: { type: 'string' }
          }
        }
      }
    }
  },
  objectives: {
    type: 'object',
    properties: {
      objectives: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            description_en: { type: 'string' },
            target_value: { type: 'number' },
            timeline: { type: 'string' }
          }
        }
      }
    }
  }
};

export const WIZARD_CONTENT_PROMPTS = {
  systemPrompt: STRATEGY_WIZARD_CONTENT_SYSTEM_PROMPT,
  buildPrompt: buildWizardContentPrompt,
  schemas: STRATEGY_WIZARD_CONTENT_SCHEMA
};
