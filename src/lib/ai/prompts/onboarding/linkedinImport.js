/**
 * LinkedIn Import Prompts for Onboarding
 * @version 1.0.0
 */

import { getSystemPrompt, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const LINKEDIN_IMPORT_SYSTEM_PROMPT = getSystemPrompt('COMPACT', true) + `

You are an AI assistant analyzing LinkedIn profiles for Saudi municipal innovation platforms.
Extract professional information and provide bilingual suggestions.
`;

/**
 * Build LinkedIn import prompt
 */
export function buildLinkedInImportPrompt(linkedinUrl) {
  return `Based on this LinkedIn profile URL: ${linkedinUrl}

Extract or infer the following information. If the URL contains a username or name pattern, try to suggest professional details.

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Return a JSON with:
1. Likely name (if inferable from URL) in both languages
2. Likely professional title/role in both English and Arabic
3. Likely industry or expertise areas
4. Suggested bio for a Saudi municipal innovation platform in both English and Arabic`;
}

export const LINKEDIN_IMPORT_SCHEMA = {
  type: 'object',
  properties: {
    full_name_en: { type: 'string', description: 'Inferred name in English if visible in URL' },
    full_name_ar: { type: 'string', description: 'Inferred name in Arabic if visible in URL' },
    job_title_en: { type: 'string', description: 'Likely job title in English' },
    job_title_ar: { type: 'string', description: 'Likely job title in Arabic' },
    expertise_areas: { type: 'array', items: { type: 'string' } },
    bio_en: { type: 'string', description: 'Suggested professional bio in English' },
    bio_ar: { type: 'string', description: 'Suggested professional bio in Arabic' }
  },
  required: ['full_name_en', 'job_title_en', 'expertise_areas', 'bio_en']
};
