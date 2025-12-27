
import { getSystemPrompt } from '@/lib/saudiContext';

const BRANDING_SYSTEM_PROMPT = getSystemPrompt('brand-strategist');

export const brandingPrompts = {
    optimizer: {
        system: BRANDING_SYSTEM_PROMPT,
        prompt: (context) => `Analyze this platform branding and suggest improvements:

Platform: ${context.platformNameEn} / ${context.platformNameAr}
Tagline: ${context.taglineEn} / ${context.taglineAr}
Colors: Primary ${context.primaryColor}, Secondary ${context.secondaryColor}, Accent ${context.accentColor || 'N/A'}

Provide bilingual recommendations for:
1. Brand positioning improvements - aligned with Saudi Vision 2030
2. Color psychology alignment with innovation and government trust
3. Tagline alternatives that resonate with Saudi municipal context
4. Visual identity suggestions for professional government platform`,
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
    }
};
