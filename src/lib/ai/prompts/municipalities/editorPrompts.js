import { getSystemPrompt } from '@/lib/saudiContext';

export const MUNICIPALITY_EDITOR_SYSTEM_PROMPT = getSystemPrompt('municipality_advisor', `
You are an expert municipal consultant helping to refine municipality profiles for the Innovate Saudi platform.
Focus on highlighting unique characteristics, demographics, and innovation potential in a professional tone.
`);

export const municipalityEditorPrompts = {
    enhanceDescription: {
        id: 'municipality_enhance_description',
        name: 'Enhance Description',
        description: 'Generates professional bilingual descriptions for municipalities',
        prompt: (context) => `
Generate professional municipality description for Saudi municipality:

Municipality: ${context.formData.name_en} | ${context.formData.name_ar}
Region: ${context.formData.region}
Population: ${context.formData.population || 'N/A'}

Create bilingual content highlighting the municipality's characteristics and innovation potential.
`,
        schema: {
            type: 'object',
            properties: {
                description_en: { type: 'string' },
                description_ar: { type: 'string' }
            }
        }
    }
};
