/**
 * Organization Profile Generator Prompts
 * AI-powered organization profile creation
 * @module prompts/organizations/profileGenerator
 */

/**
 * Organization profile generation prompt template
 * @param {Object} data - Organization data
 * @returns {string} Formatted prompt
 */
export const ORGANIZATION_PROFILE_PROMPT_TEMPLATE = (data) => `
Generate comprehensive bilingual organization profile for Saudi innovation ecosystem:

Organization Type: ${data.org_type || 'unknown'}
User Description: ${data.description || data.name_en || 'N/A'}

Generate:
1. Professional names (EN + AR)
2. Comprehensive descriptions (EN + AR, 200+ words) highlighting capabilities
3. Specializations (5-8 items bilingual objects: {name_en, name_ar})
4. Capabilities (4-6 items bilingual objects: {name_en, name_ar})
5. Suggested sectors (3-5 from: urban_design, transport, environment, digital_services, health, education, safety)
6. Team size estimate
7. Maturity level (early_stage/growth/established/mature)
${['startup', 'company', 'sme'].includes(data.org_type) ? '8. Funding stage (bootstrapped/seed/series_a/series_b/public)' : ''}
`;

/**
 * Response schema for organization profile generation
 */
export const ORGANIZATION_PROFILE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name_en: { type: 'string' },
    name_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    specializations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' }
        }
      }
    },
    capabilities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' }
        }
      }
    },
    sectors: { type: 'array', items: { type: 'string' } },
    team_size: { type: 'string' },
    maturity_level: { type: 'string' },
    funding_stage: { type: 'string' }
  }
};

/**
 * System prompt for organization profile generation
 */
export const ORGANIZATION_PROFILE_SYSTEM_PROMPT = `You are an expert in Saudi Arabian business ecosystem and innovation organizations. Generate professional, bilingual organization profiles aligned with Vision 2030.`;

export default {
  ORGANIZATION_PROFILE_PROMPT_TEMPLATE,
  ORGANIZATION_PROFILE_RESPONSE_SCHEMA,
  ORGANIZATION_PROFILE_SYSTEM_PROMPT
};
