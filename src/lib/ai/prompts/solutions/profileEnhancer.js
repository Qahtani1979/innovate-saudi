/**
 * Solution Profile Enhancer Prompts
 * @module solutions/profileEnhancer
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROFILE_ENHANCER_SYSTEM_PROMPT = getSystemPrompt('profile_enhancer', `
You are a solution profile optimization specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze solution profiles and suggest improvements to increase visibility and matching potential.
Consider Saudi market context, Vision 2030 alignment, and municipal procurement requirements.
`);

export function buildProfileEnhancerPrompt({ solution }) {
  return `Analyze this solution profile and suggest improvements:

SOLUTION: ${solution.name_en}
DESCRIPTION: ${solution.description_en || 'Not provided'}
CATEGORY: ${solution.category}
SECTOR: ${solution.sector}
TAGS: ${(solution.tags || []).join(', ')}
TRL: ${solution.trl_level || 'Not specified'}
PRICING: ${solution.pricing_model || 'Not specified'}

Analyze and suggest:
1. Profile completeness score (0-100)
2. Missing critical fields
3. Description improvements
4. Keyword suggestions for better matching
5. Competitive positioning tips
6. Vision 2030 alignment opportunities`;
}

export const PROFILE_ENHANCER_SCHEMA = {
  type: 'object',
  properties: {
    completeness_score: { type: 'number', minimum: 0, maximum: 100 },
    missing_fields: { type: 'array', items: { type: 'string' } },
    description_suggestions: {
      type: 'object',
      properties: {
        current_issues: { type: 'array', items: { type: 'string' } },
        improved_description_en: { type: 'string' },
        improved_description_ar: { type: 'string' }
      }
    },
    keyword_suggestions: { type: 'array', items: { type: 'string' } },
    competitive_tips: { type: 'array', items: { type: 'string' } },
    vision_2030_alignment: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pillar: { type: 'string' },
          alignment_suggestion: { type: 'string' }
        }
      }
    },
    priority_improvements: { type: 'array', items: { type: 'string' } }
  },
  required: ['completeness_score', 'missing_fields', 'priority_improvements']
};

export const PROFILE_ENHANCER_PROMPTS = {
  systemPrompt: PROFILE_ENHANCER_SYSTEM_PROMPT,
  buildPrompt: buildProfileEnhancerPrompt,
  schema: PROFILE_ENHANCER_SCHEMA
};
