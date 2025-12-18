/**
 * Sandbox Enhancement Prompts
 * AI-powered sandbox content enhancement
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const SANDBOX_ENHANCEMENT_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a regulatory sandbox specialist helping enhance sandbox content for Saudi municipal innovation. Provide professional, clear, and compelling bilingual content.`;

export const SANDBOX_ENHANCEMENT_PROMPT_TEMPLATE = (data = {}) => `Enhance this regulatory sandbox content for Saudi municipal innovation:

Sandbox Type: ${data.sandboxType || 'regulatory'}
Domain: ${data.domain || 'municipal services'}
Location: ${data.location || 'Saudi Arabia'}
Current Description: ${data.description || 'N/A'}

Generate comprehensive bilingual (English + Arabic) content:
1. Improved names (EN + AR) - professional and clear
2. Compelling taglines (EN + AR)
3. Detailed descriptions (EN + AR) - 200+ words each
4. Regulatory framework summary`;

export const SANDBOX_ENHANCEMENT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name_en: { type: 'string' },
    name_ar: { type: 'string' },
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    regulatory_framework: { type: 'string' }
  }
};

export default {
  SANDBOX_ENHANCEMENT_SYSTEM_PROMPT,
  SANDBOX_ENHANCEMENT_PROMPT_TEMPLATE,
  SANDBOX_ENHANCEMENT_RESPONSE_SCHEMA
};
