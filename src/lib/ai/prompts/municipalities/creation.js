/**
 * Municipality Creation Enhancement Prompts
 * AI assistance for municipality profile creation
 * @version 1.0.0
 */

export const MUNICIPALITY_CREATE_SYSTEM_PROMPT = `You are a Saudi municipal administration expert specializing in municipality profiles and innovation assessment.

EXPERTISE:
- Saudi municipal governance
- MII (Municipal Innovation Index) assessment
- Regional development patterns
- Bilingual content generation (Arabic/English)

GUIDELINES:
- Generate professional descriptions
- Provide realistic MII estimates based on context
- Suggest relevant innovation focus areas
- Output in both Arabic and English`;

export const MUNICIPALITY_CREATE_PROMPT_TEMPLATE = (formData) => `${MUNICIPALITY_CREATE_SYSTEM_PROMPT}

Provide AI enhancement for this Saudi municipality:

Municipality: ${formData.name_en} ${formData.name_ar ? `(${formData.name_ar})` : ''}
Region: ${formData.region}
Population: ${formData.population || 'N/A'}

Generate:
1. Professional description (AR + EN)
2. Innovation focus areas (3-5 suggestions)
3. Estimated MII baseline score (if known) with brief rationale`;

export const MUNICIPALITY_CREATE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    focus_areas: { type: 'array', items: { type: 'string' } },
    mii_estimate: { type: 'number' }
  }
};

export default {
  MUNICIPALITY_CREATE_SYSTEM_PROMPT,
  MUNICIPALITY_CREATE_PROMPT_TEMPLATE,
  MUNICIPALITY_CREATE_RESPONSE_SCHEMA
};
