/**
 * Impact Story Generator Prompt
 * Creates compelling success stories for program graduates
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build impact story generator prompt
 */
export function buildImpactStoryPrompt(programName, graduates) {
  const graduatesSummary = graduates.slice(0, 5).map(g => 
    `- ${g.startup_name || g.applicant_name}: ${g.sector || 'Innovation'}, ${g.impact_metrics?.jobs_created || 0} jobs created, ${g.impact_metrics?.revenue_growth || 0}% revenue growth`
  ).join('\n');

  return `${SAUDI_CONTEXT}

You are an AI content specialist for Saudi Arabia's municipal innovation programs.

PROGRAM: ${programName || 'Innovation Accelerator'}
TOTAL GRADUATES: ${graduates.length}

TOP PERFORMERS:
${graduatesSummary}

TASK: Create compelling impact stories for the top 3 performers.

FOR EACH STORY, GENERATE:
1. Compelling headline (English + Arabic)
2. Success story (200 words, before/after narrative)
3. Key metrics (3-5 quantifiable achievements)
4. Quote from founder (inspiring and authentic)
5. Social media caption (engaging, shareable)

${LANGUAGE_REQUIREMENTS}

Focus on Vision 2030 alignment, municipal impact, and innovation journey.`;
}

/**
 * Get response schema for impact stories
 */
export function getImpactStorySchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      stories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            startup: { type: 'string', description: 'Startup/graduate name' },
            headline_en: { type: 'string', description: 'English headline' },
            headline_ar: { type: 'string', description: 'Arabic headline' },
            story_en: { type: 'string', description: 'English success story' },
            story_ar: { type: 'string', description: 'Arabic success story' },
            metrics: { type: 'array', items: { type: 'string' }, description: 'Key metrics' },
            metrics_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic metrics' },
            quote: { type: 'string', description: 'Founder quote' },
            quote_ar: { type: 'string', description: 'Arabic quote' },
            social_caption: { type: 'string', description: 'Social media caption' },
            social_caption_ar: { type: 'string', description: 'Arabic social caption' }
          },
          required: ['startup', 'headline_en', 'headline_ar', 'story_en', 'story_ar', 'metrics', 'quote', 'social_caption']
        }
      }
    },
    required: ['stories']
  });
}

export const IMPACT_STORY_SYSTEM_PROMPT = `You are an AI content specialist for Saudi Arabia's municipal innovation programs. You create compelling, authentic success stories that highlight graduate achievements and program impact. Always provide bilingual content.`;
