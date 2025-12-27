import { getSystemPrompt } from '@/lib/saudiContext';

export const TAXONOMY_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert taxonomist for Saudi municipal innovation.
Focus on:
- Hierarchical classification
- Standardized terminology (Arabic/English)
- Alignment with UN SDG and Vision 2030 sectors
`;

export const taxonomyPrompts = {
    suggestions: {
        id: 'taxonomy_suggestions',
        name: 'Taxonomy Suggestions',
        description: 'Suggest taxonomy categories',
        prompt: (context) => `Suggest taxonomy categories for: ${context.input}`,
        schema: {
            type: 'object',
            properties: {
                categories: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' } } } }
            }
        }
    }
};
