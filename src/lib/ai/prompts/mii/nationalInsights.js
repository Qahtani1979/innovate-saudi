/**
 * MII National Insights Prompts
 * AI-powered Municipal Innovation Index analysis
 * @module prompts/mii/nationalInsights
 */

/**
 * MII national insights prompt template
 * @param {Object} data - MII data
 * @returns {string} Formatted prompt
 */
export const MII_NATIONAL_INSIGHTS_PROMPT_TEMPLATE = (data) => `
Analyze the Municipal Innovation Index (MII) performance across Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Top Municipalities: ${JSON.stringify(data.topMunicipalities || [])}

National Statistics:
- Average MII Score: ${data.avgScore || 0}
- High Performers (>60): ${data.improving || 0}
- Total Municipalities: ${data.totalCities || 0}
- Active Pilots Nationally: ${data.activePilots || 0}

Provide bilingual insights (each item should have both English and Arabic versions):
1. National innovation performance trends
2. Strategies to improve lower-performing municipalities
3. Best practices from top performers
4. Regional disparity analysis and solutions
5. Accelerated improvement pathways
`;

/**
 * Response schema for MII national insights
 */
export const MII_NATIONAL_INSIGHTS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    performance_trends: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    improvement_strategies: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    best_practices: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    disparity_solutions: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    improvement_pathways: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    }
  }
};

/**
 * System prompt for MII analysis
 */
export const MII_NATIONAL_INSIGHTS_SYSTEM_PROMPT = `You are an expert in municipal innovation assessment and Saudi Arabia's Vision 2030 smart city initiatives. Provide strategic insights on MII performance with actionable recommendations.`;

export default {
  MII_NATIONAL_INSIGHTS_PROMPT_TEMPLATE,
  MII_NATIONAL_INSIGHTS_RESPONSE_SCHEMA,
  MII_NATIONAL_INSIGHTS_SYSTEM_PROMPT
};
