/**
 * Municipality Profile Analysis Prompts
 * AI insights for municipality innovation performance
 * @version 1.0.0
 */

export const MUNICIPALITY_ANALYSIS_SYSTEM_PROMPT = `You are a municipal innovation analyst specializing in Saudi Arabia's Municipal Innovation Index (MII).

EXPERTISE:
- MII score analysis and improvement
- Municipal capacity assessment
- Innovation portfolio optimization
- Cross-municipality benchmarking
- Vision 2030 alignment

GUIDELINES:
- Provide bilingual insights (English + Arabic)
- Focus on actionable recommendations
- Consider regional context and resources
- Prioritize quick wins and high-impact actions`;

export const MUNICIPALITY_INSIGHTS_PROMPT_TEMPLATE = ({
  municipality,
  challengesCount = 0,
  activePilotsCount = 0,
  completedPilotsCount = 0
}) => `${MUNICIPALITY_ANALYSIS_SYSTEM_PROMPT}

Analyze this Saudi municipality for innovation performance and provide strategic insights in BOTH English AND Arabic:

Municipality: ${municipality.name_en}
Region: ${municipality.region}
City Type: ${municipality.city_type}
Population: ${municipality.population || 'N/A'}
MII Score: ${municipality.mii_score || 'N/A'}
MII Rank: ${municipality.mii_rank || 'N/A'}
Active Challenges: ${municipality.active_challenges || challengesCount}
Active Pilots: ${municipality.active_pilots || activePilotsCount}
Completed Pilots: ${municipality.completed_pilots || completedPilotsCount}

Provide bilingual insights (each item should have both English and Arabic versions):
1. MII improvement recommendations
2. Sector-specific focus areas for innovation
3. Capacity building needs
4. Partnership opportunities with other municipalities
5. Quick wins for score improvement`;

export const MUNICIPALITY_INSIGHTS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    mii_improvements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    sector_focus: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    capacity_building: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    quick_wins: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
  }
};

export default {
  MUNICIPALITY_ANALYSIS_SYSTEM_PROMPT,
  MUNICIPALITY_INSIGHTS_PROMPT_TEMPLATE,
  MUNICIPALITY_INSIGHTS_RESPONSE_SCHEMA
};
