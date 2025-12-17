/**
 * Profile Completion Suggestions Prompt
 * Analyzes user profiles and suggests improvements
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build profile completion prompt
 */
export function buildProfileCompletionPrompt(profile) {
  return `${SAUDI_CONTEXT}

You are an AI profile optimization specialist for Saudi Arabia's municipal innovation platform.

USER PROFILE ANALYSIS:
- Bio (English): ${profile?.bio_en || 'Not provided'}
- Bio (Arabic): ${profile?.bio_ar || 'Not provided'}
- Current Title: ${profile?.title_en || 'Not specified'}
- Title (Arabic): ${profile?.title_ar || 'Not specified'}
- Expertise Areas: ${profile?.expertise_areas?.join(', ') || 'None listed'}
- Organization: ${profile?.organization_id ? 'Linked' : 'Not linked'}
- Social Links: ${profile?.social_links?.linkedin ? 'LinkedIn connected' : 'No LinkedIn'}
- Avatar: ${profile?.avatar_url ? 'Uploaded' : 'Missing'}

TASK: Analyze this profile and provide actionable improvement suggestions.

PROVIDE:
1. List of missing sections that should be completed
2. Specific improvements for existing content
3. Recommended expertise tags relevant to Saudi innovation ecosystem
4. Networking opportunities based on profile

${LANGUAGE_REQUIREMENTS}

Focus on professional growth within Saudi Vision 2030 context.`;
}

/**
 * Get response schema for profile completion
 */
export function getProfileCompletionSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      missing_sections: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Sections that need completion'
      },
      missing_sections_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic missing sections'
      },
      improvements: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            field: { type: 'string' },
            field_ar: { type: 'string' },
            suggestion_en: { type: 'string' }, 
            suggestion_ar: { type: 'string' } 
          } 
        },
        description: 'Improvement suggestions per field'
      },
      recommended_tags: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Recommended expertise tags'
      },
      recommended_tags_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic expertise tags'
      },
      networking_opportunities: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Networking suggestions'
      },
      networking_opportunities_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic networking suggestions'
      }
    },
    required: ['missing_sections', 'improvements', 'recommended_tags', 'networking_opportunities']
  });
}

export const PROFILE_COMPLETION_SYSTEM_PROMPT = `You are an AI profile optimization specialist for Saudi Arabia's municipal innovation platform. You help professionals enhance their profiles for better visibility and networking opportunities within the Vision 2030 ecosystem. Always provide bilingual responses.`;
