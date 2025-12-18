/**
 * Living Lab enhancement prompts
 * @module livinglab/enhance
 */

export const LIVINGLAB_ENHANCE_SYSTEM_PROMPT = `You are an expert in Living Lab design and urban innovation for Saudi municipalities aligned with Vision 2030.`;

export const createLivingLabEnhancePrompt = (formData) => `Enhance this Living Lab proposal with professional content:

Living Lab Name: ${formData.name_en}
Arabic Name: ${formData.name_ar || 'N/A'}
Description: ${formData.description_en}
Focus Area: ${formData.focus_area || 'N/A'}
Municipality: ${formData.municipality_name || 'N/A'}
Target Population: ${formData.target_population || 'N/A'}

Enhance with (BILINGUAL):
1. Refined Vision and Mission
2. Innovation Themes
3. Stakeholder Engagement Strategy
4. Co-creation Methodology
5. Success Metrics
6. Sustainability Plan`;

export const LIVINGLAB_ENHANCE_SCHEMA = {
  type: 'object',
  properties: {
    vision_en: { type: 'string' },
    vision_ar: { type: 'string' },
    mission_en: { type: 'string' },
    mission_ar: { type: 'string' },
    innovation_themes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          theme_en: { type: 'string' },
          theme_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    },
    stakeholder_strategy_en: { type: 'string' },
    stakeholder_strategy_ar: { type: 'string' },
    cocreation_methodology_en: { type: 'string' },
    cocreation_methodology_ar: { type: 'string' },
    success_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric_en: { type: 'string' },
          metric_ar: { type: 'string' },
          target: { type: 'string' }
        }
      }
    },
    sustainability_plan_en: { type: 'string' },
    sustainability_plan_ar: { type: 'string' }
  }
};
