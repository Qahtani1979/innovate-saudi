import { getSystemPrompt } from '@/lib/saudiContext';

export const ORGANIZATION_PROFILE_SYSTEM_PROMPT = getSystemPrompt('business_analyst', `
You are an expert bilingual content writer for organizational profiles.
Focus on professional tone and accurate business terminology.
`);

export const organizationProfilePrompts = {
    enhance: {
        id: 'org_profile_enhance',
        name: 'Enhance Organization Profile',
        description: 'Generates professional bilingual descriptions for organizations',
        prompt: (context) => `
Enhance this organization profile with professional, detailed bilingual content:

Organization: ${context.formData.name_en}
Type: ${context.formData.org_type}
Current Description: ${context.formData.description_en || 'N/A'}

Generate comprehensive bilingual (English + Arabic) content:
1. Improved names (EN + AR)
2. Professional descriptions (EN + AR) - 150+ words each
`,
        schema: {
            type: 'object',
            properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' }
            }
        }
    }
};
