/**
 * Alumni Success Story Generator Prompts
 * For generating compelling alumni success stories
 * @module prompts/programs/alumniStory
 */

export const ALUMNI_STORY_SYSTEM_PROMPT = `You are a storytelling expert for Saudi government innovation programs.
Generate compelling, bilingual success stories that inspire and showcase program impact.
Create professional content suitable for social media, websites, and reports.`;

export const buildAlumniStoryPrompt = ({ alumnus, program }) => {
  return `Generate a compelling alumni success story for a Saudi municipal innovation program graduate.

Program: ${program.name_en || 'Innovation Program'}
Graduate: ${alumnus.applicant_name || 'Graduate'}
Organization: ${alumnus.applicant_org_name || 'N/A'}
Sector: ${alumnus.focus_sector || 'Innovation'}
Achievements:
- Solutions created: ${alumnus.solutions_count || 0}
- Pilots launched: ${alumnus.pilots_count || 0}
- Program completion: ${alumnus.graduation_date || 'Recent'}

Generate a professional success story in BOTH English and Arabic with:
1. Compelling headline (bilingual)
2. Challenge they faced before program
3. Journey through the program (key moments)
4. Impact achieved after graduation
5. Quote from the graduate (fictional but realistic)
6. Future aspirations

Make it inspiring and suitable for social media, website, and reports.`;
};

export const ALUMNI_STORY_SCHEMA = {
  type: 'object',
  properties: {
    headline_en: { type: 'string', description: 'Headline in English' },
    headline_ar: { type: 'string', description: 'Headline in Arabic' },
    story_en: { type: 'string', description: 'Full story in English' },
    story_ar: { type: 'string', description: 'Full story in Arabic' },
    quote_en: { type: 'string', description: 'Quote in English' },
    quote_ar: { type: 'string', description: 'Quote in Arabic' },
    key_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric_en: { type: 'string' },
          metric_ar: { type: 'string' },
          value: { type: 'string' }
        }
      },
      description: 'Key achievement metrics'
    }
  },
  required: ['headline_en', 'headline_ar', 'story_en', 'story_ar']
};

export default {
  system: ALUMNI_STORY_SYSTEM_PROMPT,
  buildPrompt: buildAlumniStoryPrompt,
  schema: ALUMNI_STORY_SCHEMA
};
