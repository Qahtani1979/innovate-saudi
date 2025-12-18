/**
 * Matchmaker Application Prompt Module
 * Prompts for matchmaker application profile enhancement
 * @module prompts/matchmaker/application
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Matchmaker profile enhancement prompt
 */
export const MATCHMAKER_PROFILE_ENHANCE_PROMPT = {
  system: `You are an AI assistant helping organizations create professional profiles for Saudi municipal innovation matchmaking.
${SAUDI_CONTEXT.VISION_2030}

Generate bilingual content (English and Arabic) that:
- Is professional and formal
- Highlights innovation capabilities
- Aligns with Saudi Vision 2030 goals
- Emphasizes collaboration potential`,
  
  schema: {
    type: 'object',
    properties: {
      organization_name_ar: { type: 'string' },
      collaboration_approach_en: { type: 'string' },
      collaboration_approach_ar: { type: 'string' }
    }
  }
};

/**
 * Template for matchmaker profile enhancement
 */
export const MATCHMAKER_PROFILE_ENHANCE_PROMPT_TEMPLATE = (formData) => ({
  ...MATCHMAKER_PROFILE_ENHANCE_PROMPT,
  prompt: `Based on this organization info, generate bilingual profile. CRITICAL: Provide BOTH English AND Arabic.

Organization: ${formData.organization_name_en}
Website: ${formData.website || 'N/A'}
Sectors: ${formData.sectors?.join(', ') || 'N/A'}
Collaboration: ${formData.collaboration_approach || 'N/A'}

Generate:
- organization_name_ar (Arabic translation if missing)
- collaboration_approach enhanced version (2-3 sentences each language)`
});

export default {
  MATCHMAKER_PROFILE_ENHANCE_PROMPT,
  MATCHMAKER_PROFILE_ENHANCE_PROMPT_TEMPLATE
};
