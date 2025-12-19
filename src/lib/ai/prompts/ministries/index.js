/**
 * Ministry AI Prompts Index
 * Centralized exports for all ministry-related AI prompts
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Ministry analysis prompt
 */
export const MINISTRY_ANALYSIS_SYSTEM_PROMPT = `You are a Saudi government ministry analyst specializing in inter-ministerial coordination and Vision 2030 alignment.

EXPERTISE:
- Saudi government structure and ministry functions
- Vision 2030 program alignment
- Inter-ministerial coordination
- Policy and regulation analysis
- Municipal-ministry relationships

GUIDELINES:
- Provide strategic insights
- Focus on Vision 2030 alignment
- Consider cross-ministry dependencies
- Generate bilingual content (Arabic/English)`;

/**
 * Ministry collaboration prompt template
 */
export const MINISTRY_COLLABORATION_PROMPT_TEMPLATE = (ministry, context) => `
Analyze ministry collaboration opportunities:

Ministry: ${ministry.name_en}
${ministry.name_ar ? `Arabic Name: ${ministry.name_ar}` : ''}
Code: ${ministry.code || 'Not specified'}
Sector: ${context?.sector_name || 'Not specified'}

${SAUDI_CONTEXT}

Analyze:
1. Key municipal touchpoints
2. Policy coordination opportunities
3. Data sharing possibilities
4. Joint initiative potential
5. Regulatory alignment needs
`;

/**
 * Ministry profile enhancement prompt
 */
export const MINISTRY_PROFILE_PROMPT_TEMPLATE = (ministry) => `
${MINISTRY_ANALYSIS_SYSTEM_PROMPT}

Enhance this ministry profile:

Ministry: ${ministry.name_en}
${ministry.name_ar ? `Arabic Name: ${ministry.name_ar}` : ''}
Code: ${ministry.code || 'N/A'}
Website: ${ministry.website || 'N/A'}

Generate:
1. Professional description (Arabic + English)
2. Key responsibilities
3. Municipal coordination areas
4. Vision 2030 programs alignment
`;

export const MINISTRY_PROFILE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    responsibilities: { type: 'array', items: { type: 'string' } },
    municipal_areas: { type: 'array', items: { type: 'string' } },
    vision_programs: { type: 'array', items: { type: 'string' } }
  }
};

/**
 * Ministry service alignment prompt
 */
export const MINISTRY_SERVICE_ALIGNMENT_PROMPT_TEMPLATE = (ministry, services) => `
Analyze ministry service alignment with municipal needs:

Ministry: ${ministry.name_en}

Services:
${services.map(s => `- ${s.name_en}`).join('\n')}

Provide:
1. Service gaps identification
2. Integration opportunities
3. Digital transformation priorities
4. Citizen experience improvements
`;

export const MINISTRY_SERVICE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    service_gaps: { type: 'array', items: { type: 'string' } },
    integration_opportunities: { type: 'array', items: { type: 'string' } },
    digital_priorities: { type: 'array', items: { type: 'string' } },
    cx_improvements: { type: 'array', items: { type: 'string' } }
  }
};

export default {
  MINISTRY_ANALYSIS_SYSTEM_PROMPT,
  MINISTRY_COLLABORATION_PROMPT_TEMPLATE,
  MINISTRY_PROFILE_PROMPT_TEMPLATE,
  MINISTRY_PROFILE_RESPONSE_SCHEMA,
  MINISTRY_SERVICE_ALIGNMENT_PROMPT_TEMPLATE,
  MINISTRY_SERVICE_RESPONSE_SCHEMA
};
