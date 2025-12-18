/**
 * Cross-City Solution Sharing Prompts
 * @module challenges/crossCitySharing
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CROSS_CITY_SHARING_SYSTEM_PROMPT = getSystemPrompt('cross_city_sharing', `
You are a municipal solution sharing specialist for Saudi Arabia.
Your role is to recommend which municipalities would benefit from adopting successful solutions.
Consider demographics, MII capacity, sector alignment, and geographic proximity.
`);

/**
 * Build cross-city recommendation prompt
 * @param {Object} params - Challenge and municipality data
 * @returns {string} Formatted prompt
 */
export function buildCrossCitySharingPrompt({ challenge, municipalities }) {
  return `Recommend which municipalities should adopt this solution:

Challenge: ${challenge?.title_en || challenge?.title || 'Unknown'}
Sector: ${challenge?.sector || 'general'}
Municipality: ${challenge?.municipality_id || 'Unknown'}

Available municipalities: ${(municipalities || []).map(m => 
  `${m.name_en} (population: ${m.population || 'N/A'}, MII: ${m.mii_score || 'N/A'})`
).join(', ')}

Recommend top 5 municipalities that would benefit most, considering:
- Similar demographics
- MII capacity
- Sector alignment
- Geographic proximity`;
}

export const CROSS_CITY_SHARING_SCHEMA = {
  type: 'object',
  properties: {
    recommended_cities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          municipality_name: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    }
  },
  required: ['recommended_cities']
};

export const CROSS_CITY_SHARING_PROMPTS = {
  systemPrompt: CROSS_CITY_SHARING_SYSTEM_PROMPT,
  buildPrompt: buildCrossCitySharingPrompt,
  schema: CROSS_CITY_SHARING_SCHEMA
};
