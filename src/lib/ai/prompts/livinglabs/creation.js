/**
 * Living Lab Creation Prompts
 * AI-powered proposal enhancement for Living Labs
 * @module prompts/livinglabs/creation
 */

/**
 * Living Lab enhancement prompt template
 * @param {Object} labData - Lab form data
 * @returns {string} Formatted prompt
 */
export const LIVING_LAB_ENHANCE_PROMPT_TEMPLATE = (labData) => `
Enhance this Living Lab proposal with professional content:

Lab Name: ${labData.name_en || 'N/A'}
Type: ${labData.type || 'N/A'}
Description: ${labData.description_en || 'N/A'}

Provide bilingual enhancements:
1. Professional tagline (AR + EN)
2. Expanded description highlighting innovation impact (AR + EN)
3. Clear objectives for research and testing (AR + EN)
4. Suggested equipment catalog (5-7 items)
5. Key capabilities this lab should offer
`;

/**
 * Response schema for Living Lab enhancement
 */
export const LIVING_LAB_ENHANCE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    objectives_en: { type: 'string' },
    objectives_ar: { type: 'string' },
    equipment_suggestions: { 
      type: 'array', 
      items: { type: 'string' } 
    }
  }
};

/**
 * System prompt for Living Lab enhancement
 */
export const LIVING_LAB_ENHANCE_SYSTEM_PROMPT = `You are an expert in innovation labs and R&D facilities, specializing in Saudi Arabia's municipal innovation ecosystem. Generate professional, bilingual content that aligns with Vision 2030 smart city objectives.`;

export default {
  LIVING_LAB_ENHANCE_PROMPT_TEMPLATE,
  LIVING_LAB_ENHANCE_RESPONSE_SCHEMA,
  LIVING_LAB_ENHANCE_SYSTEM_PROMPT
};
