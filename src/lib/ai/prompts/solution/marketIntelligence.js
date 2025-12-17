/**
 * Market Intelligence AI Prompts
 * Provides market trends and intelligence for solutions
 * @module solution/marketIntelligence
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate market intelligence prompt
 */
export function generateMarketIntelligencePrompt(solution, marketData = {}) {
  return `Analyze market intelligence for this solution in Saudi Arabia's municipal tech market.

SOLUTION:
Name: ${solution?.name_en || 'Unknown'}
Provider: ${solution?.provider_name || 'Unknown'}
Sectors: ${solution?.sectors?.join(', ') || 'N/A'}
Current Deployments: ${solution?.deployment_count || 0}
Success Rate: ${solution?.success_rate || 0}%

MARKET DATA:
Total Solutions in Sector: ${marketData.totalSolutions || 'N/A'}
Average Success Rate: ${marketData.avgSuccessRate || 'N/A'}%
Top Regions: ${marketData.topRegions?.join(', ') || 'N/A'}
Growth Trend: ${marketData.growthTrend || 'N/A'}

VISION 2030 ALIGNMENT:
- Smart Cities Initiative
- Digital Government
- Municipal Services Modernization
- Economic Diversification

Provide bilingual market intelligence (AR+EN):
1. Market size and opportunity
2. Demand trends in municipal sector
3. Key adoption drivers
4. Barriers to entry
5. Competitive landscape overview
6. Growth potential (1-5 years)
7. Strategic recommendations`;
}

/**
 * Get market intelligence schema
 */
export function getMarketIntelligenceSchema() {
  return {
    type: 'object',
    properties: {
      market_size: {
        type: 'object',
        properties: {
          current_sar: { type: 'number' },
          projected_sar: { type: 'number' },
          growth_rate: { type: 'number' }
        }
      },
      demand_trends: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            trend: { type: 'string' },
            impact: { type: 'string' },
            timeline: { type: 'string' }
          }
        }
      },
      adoption_drivers: {
        type: 'array',
        items: { type: 'string' }
      },
      barriers: {
        type: 'array',
        items: { type: 'string' }
      },
      competitive_landscape: {
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      },
      growth_potential: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          timeframe: { type: 'string' },
          factors: { type: 'array', items: { type: 'string' } }
        }
      },
      strategic_recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            ar: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      },
      vision_2030_alignment: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          initiatives: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  };
}

/**
 * Get system prompt for market intelligence
 */
export function getMarketIntelligenceSystemPrompt() {
  return getSystemPrompt('market-intelligence-analyst');
}

export const MARKET_INTELLIGENCE_CONFIG = {
  name: 'market-intelligence',
  version: '1.0.0',
  description: 'AI-powered market intelligence for municipal solutions'
};
