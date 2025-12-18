/**
 * Profile AI Suggestions Prompts for Onboarding
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROFILE_SUGGESTIONS_SYSTEM_PROMPT = getSystemPrompt('profile_suggestions', `
You are an AI assistant helping users complete their profile on Saudi Innovates, a municipal innovation platform in Saudi Arabia.
Analyze provided information and fill in missing fields with intelligent bilingual suggestions.
`);

/**
 * Build profile suggestions prompt
 */
export function buildProfileSuggestionsPrompt(formData, availableSectors) {
  return `You are an AI assistant helping users complete their profile on Saudi Innovates, a municipal innovation platform in Saudi Arabia. 
        
Analyze the provided user information and FILL IN ALL MISSING FIELDS with intelligent suggestions based on context clues. PROVIDE ALL TEXT IN BOTH ENGLISH AND ARABIC.

User Profile (current data):
- Full Name (EN): ${formData.full_name_en || 'Not provided'}
- Full Name (AR): ${formData.full_name_ar || 'Not provided'}
- Job Title (EN): ${formData.job_title_en || 'Not provided'}
- Job Title (AR): ${formData.job_title_ar || 'Not provided'}
- Organization (EN): ${formData.organization_en || 'Not provided'}
- Organization (AR): ${formData.organization_ar || 'Not provided'}
- Department (EN): ${formData.department_en || 'Not provided'}
- Department (AR): ${formData.department_ar || 'Not provided'}
- Bio (EN): ${formData.bio_en || 'Not provided'}
- Bio (AR): ${formData.bio_ar || 'Not provided'}
- Years of Experience: ${formData.years_of_experience || 0}
- Education Level: ${formData.education_level || 'Not provided'}
- Degree/Field of Study: ${formData.degree || 'Not provided'}
- Mobile Number: ${formData.mobile_number || 'Not provided'}
- City: ${formData.location_city || 'Not provided'}
- Region: ${formData.location_region || 'Not provided'}
- Gender: ${formData.gender || 'Not provided'}
- Date of Birth: ${formData.date_of_birth || 'Not provided'}
- LinkedIn: ${formData.linkedin_url || 'Not provided'}
- Has CV Uploaded: ${formData.cv_url ? 'Yes' : 'No'}
- Current Expertise Areas: ${formData.expertise_areas?.join(', ') || 'Not provided'}
- Languages Spoken: ${formData.languages?.join(', ') || 'Not provided'}
- User's Preferred Language: ${formData.preferred_language}

IMPORTANT: Based on any context clues from name, job title, organization, or LinkedIn URL:
1. If organization not provided, suggest a likely organization type based on job title
2. If department not provided, infer from job title
3. If years of experience not provided, estimate based on seniority in job title
4. If education not provided, suggest appropriate level based on job title
5. If city/region not provided, suggest major Saudi cities (Riyadh, Jeddah, Dammam)
6. Suggest languages (Arabic should always be included for Saudi context, English if professional context suggests it)

Available Expertise Areas to choose from: ${availableSectors}

Return comprehensive suggestions for all fields.`;
}

export const PROFILE_SUGGESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    // Name suggestions
    full_name_en: { type: 'string', description: 'English version of name if only Arabic provided' },
    full_name_ar: { type: 'string', description: 'Arabic version of name if only English provided' },
    // Bio
    improved_bio_en: { type: 'string', description: 'Professional bio in English (2-3 sentences)' },
    improved_bio_ar: { type: 'string', description: 'Professional bio in Arabic (2-3 sentences)' },
    // Job details
    job_title_en: { type: 'string' },
    job_title_ar: { type: 'string' },
    organization_en: { type: 'string' },
    organization_ar: { type: 'string' },
    department_en: { type: 'string' },
    department_ar: { type: 'string' },
    // Experience & Education
    years_of_experience: { type: 'number', description: 'Estimated years of experience' },
    education_level: { type: 'string', enum: ['high_school', 'diploma', 'bachelor', 'master', 'doctorate'] },
    degree: { type: 'string', description: 'Field of study' },
    // Location
    location_city: { type: 'string' },
    location_region: { type: 'string' },
    // Languages
    languages: { type: 'array', items: { type: 'string' }, description: 'Languages spoken' },
    // Role recommendation
    recommended_persona: { type: 'string', enum: ['municipality_staff', 'provider', 'researcher', 'expert', 'citizen', 'viewer'] },
    persona_reason_en: { type: 'string' },
    persona_reason_ar: { type: 'string' },
    // Expertise
    suggested_expertise: { type: 'array', items: { type: 'string' }, description: 'Match exactly from available sectors' },
    // Tips
    getting_started_tips_en: { type: 'array', items: { type: 'string' } },
    getting_started_tips_ar: { type: 'array', items: { type: 'string' } }
  }
};
