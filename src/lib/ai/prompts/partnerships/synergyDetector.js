/**
 * Synergy Detector Prompt
 * Used by: PartnershipSynergyDetector.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildSynergyDetectorPrompt = (organizations) => {
  const orgList = organizations.slice(0, 20).map(o => `
${o.name_en}
Type: ${o.organization_type}
Expertise: ${o.expertise_areas?.join(', ')}
Sectors: ${o.sectors?.join(', ')}
`).join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are identifying multi-party collaboration opportunities for Saudi municipal innovation.

## AVAILABLE ORGANIZATIONS (${organizations.length})
${orgList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## SYNERGY DETECTION REQUIREMENTS
Find synergies where 2-3 organizations could collaborate effectively:
- Complementary capabilities
- End-to-end solution coverage
- Strategic alignment with Vision 2030
- Municipal innovation focus

Recommend top 3 multi-party collaboration opportunities with:
1. Partner names
2. Synergy score (0-100)
3. Use case description
4. Value proposition
5. How capabilities complement each other`;
};

export const synergyDetectorSchema = {
  type: 'object',
  required: ['opportunities'],
  properties: {
    opportunities: {
      type: 'array',
      items: {
        type: 'object',
        required: ['partners', 'synergy_score', 'use_case'],
        properties: {
          partners: { type: 'array', items: { type: 'string' } },
          synergy_score: { type: 'number', minimum: 0, maximum: 100 },
          use_case: { type: 'string' },
          value_proposition: { type: 'string' },
          complementarity: { type: 'string' }
        }
      }
    }
  }
};

export const SYNERGY_DETECTOR_SYSTEM_PROMPT = `You are a strategic collaboration analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify multi-party partnership opportunities where organizations with complementary capabilities can create synergistic value for municipal innovation.`;
