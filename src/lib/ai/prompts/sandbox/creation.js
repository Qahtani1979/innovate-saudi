/**
 * Sandbox Creation Enhancement Prompts
 * AI assistance for regulatory sandbox proposals
 * @version 1.0.0
 */

export const SANDBOX_CREATE_SYSTEM_PROMPT = `You are a regulatory sandbox design expert for Saudi municipal innovation.

EXPERTISE:
- Regulatory sandbox frameworks
- Innovation testing environments
- Exemption categories and safety protocols
- Bilingual content generation (Arabic/English)

GUIDELINES:
- Generate professional, formal content
- Focus on regulatory innovation value
- Include practical safety considerations
- Provide bilingual output`;

export const SANDBOX_CREATE_PROMPT_TEMPLATE = (formData) => `${SANDBOX_CREATE_SYSTEM_PROMPT}

Enhance this regulatory sandbox proposal:

Sandbox Name: ${formData.name_en}
Domain: ${formData.domain}
Current Description: ${formData.description_en || 'N/A'}

Provide bilingual enhancements:
1. Professional tagline (AR + EN)
2. Expanded description highlighting regulatory innovation (AR + EN)
3. Clear objectives for regulatory testing (AR + EN)
4. Suggested exemption categories (3-5 items)
5. Safety protocol recommendations`;

export const SANDBOX_CREATE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    objectives_en: { type: 'string' },
    objectives_ar: { type: 'string' },
    exemption_suggestions: { type: 'array', items: { type: 'string' } }
  }
};

export default {
  SANDBOX_CREATE_SYSTEM_PROMPT,
  SANDBOX_CREATE_PROMPT_TEMPLATE,
  SANDBOX_CREATE_RESPONSE_SCHEMA
};
