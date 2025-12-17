/**
 * Challenge submission brief prompts
 * @module challenges/submissionBrief
 */

export const SUBMISSION_BRIEF_SYSTEM_PROMPT = `You are an expert in analyzing municipal innovation challenges for Saudi Arabia. Generate professional bilingual content (English and Arabic) suitable for government review processes.`;

export const createSubmissionBriefPrompt = (challenge) => `Generate a bilingual submission brief for this challenge. CRITICAL: Provide ALL text in BOTH English AND Arabic.

Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}
Priority: ${challenge.priority}
Affected Population: ${JSON.stringify(challenge.affected_population)}

Provide (BILINGUAL - each field in both EN and AR):
1. Executive summary (2-3 sentences in English and Arabic)
2. Key highlights (3 bullet points - each in English and Arabic)
3. Expected complexity (low/medium/high with bilingual reason)
4. Recommended reviewers (types of expertise needed - bilingual)
5. Estimated review time (days)`;

export const SUBMISSION_BRIEF_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    key_highlights: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      } 
    },
    complexity: { type: 'string' },
    complexity_reason_en: { type: 'string' },
    complexity_reason_ar: { type: 'string' },
    recommended_reviewers: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      } 
    },
    estimated_review_days: { type: 'number' }
  }
};
