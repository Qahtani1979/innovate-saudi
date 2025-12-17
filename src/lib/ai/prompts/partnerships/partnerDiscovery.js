/**
 * Partner Discovery Prompt
 * Used by: AIPartnerDiscovery.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildPartnerDiscoveryPrompt = (sector, keywords, requirements, organizations) => {
  const orgList = organizations.slice(0, 15).map(o => `
${o.name_en}
Type: ${o.organization_type}
Sectors: ${o.sectors?.join(', ')}
Expertise: ${o.expertise_areas?.join(', ')}
Track Record: ${o.partnerships_count || 0} partnerships
`).join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are discovering ideal partners for a Saudi municipal innovation initiative.

## INITIATIVE CONTEXT

### Sector
${sector || 'Not specified'}

### Keywords
${keywords?.join(', ') || 'None'}

### Partner Requirements
${requirements || 'General partnership'}

## AVAILABLE ORGANIZATIONS (${organizations.length})
${orgList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## RECOMMENDATION REQUIREMENTS
Recommend top 5 partner organizations based on:
1. Best technical capability match
2. Strong track record in Saudi context
3. Sector expertise alignment
4. Capacity availability
5. Compatibility score (0-100)

For each recommendation provide:
- Organization name
- Match score (0-100)
- Rationale for recommendation
- Key strengths
- Track record summary`;
};

export const partnerDiscoverySchema = {
  type: 'object',
  required: ['recommendations'],
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['organization_name', 'match_score', 'rationale'],
        properties: {
          organization_name: { type: 'string' },
          match_score: { type: 'number', minimum: 0, maximum: 100 },
          rationale: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          track_record_summary: { type: 'string' }
        }
      }
    }
  }
};

export const PARTNER_DISCOVERY_SYSTEM_PROMPT = `You are a partnership development specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify and recommend ideal partners for municipal innovation initiatives based on capabilities, track record, and strategic alignment with Vision 2030.`;
