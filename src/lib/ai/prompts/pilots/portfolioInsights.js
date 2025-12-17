/**
 * Pilots Portfolio AI Insights Prompt
 * Provides strategic analysis of pilot portfolio
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { flatBilingualFields } from '@/lib/ai/bilingualSchemaBuilder';

/**
 * Generates prompt for portfolio insights
 * @param {Object} portfolioData - Aggregated portfolio data
 * @returns {string} Formatted prompt
 */
export function getPilotPortfolioInsightsPrompt(portfolioData) {
  const {
    totalPilots,
    activePilots,
    highSuccess,
    highRisk,
    readyToScale,
    sectorBreakdown,
    topPilots
  } = portfolioData;

  return `${SAUDI_CONTEXT.MUNICIPAL}

Analyze this municipal pilot portfolio and provide BILINGUAL strategic insights.

PORTFOLIO OVERVIEW:
- Total Pilots: ${totalPilots}
- Active Pilots: ${activePilots}
- High-Success Pilots: ${highSuccess}
- High-Risk Pilots: ${highRisk}
- Ready to Scale: ${readyToScale}

SECTOR BREAKDOWN:
${Object.entries(sectorBreakdown).map(([sector, count]) => `- ${sector}: ${count}`).join('\n')}

TOP 5 PILOTS BY SUCCESS:
${topPilots.map(p => `${p.code}: ${p.title_en} (${p.success_probability}% success probability)`).join('\n')}

${LANGUAGE_REQUIREMENTS}

Provide bilingual analysis covering:
1. PORTFOLIO HEALTH: Overall assessment with score (0-100)
2. RISK ALERTS: Top 3 risks with priority levels
3. SCALING OPPORTUNITIES: Which pilots to prioritize for scaling
4. SECTOR BALANCE: Recommendations for sector distribution
5. RESOURCE OPTIMIZATION: How to better allocate resources
6. STRATEGIC PRIORITIES: Top recommendations for next quarter`;
}

/**
 * JSON schema for portfolio insights response
 */
export const pilotPortfolioInsightsSchema = {
  type: 'object',
  properties: {
    portfolio_health: { 
      type: 'object', 
      properties: { 
        ...flatBilingualFields('assessment'),
        score: { type: 'number' } 
      },
      required: ['en', 'ar', 'score']
    },
    risk_alerts: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          ...flatBilingualFields('alert'),
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        },
        required: ['en', 'ar', 'priority']
      }
    },
    scaling_opportunities: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          pilot_code: { type: 'string' }, 
          reason_en: { type: 'string' }, 
          reason_ar: { type: 'string' } 
        },
        required: ['pilot_code', 'reason_en', 'reason_ar']
      }
    },
    sector_recommendations: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: flatBilingualFields('recommendation'),
        required: ['en', 'ar']
      }
    },
    resource_optimization: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: flatBilingualFields('suggestion'),
        required: ['en', 'ar']
      }
    },
    strategic_priorities: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: flatBilingualFields('priority'),
        required: ['en', 'ar']
      }
    }
  },
  required: ['portfolio_health', 'risk_alerts', 'scaling_opportunities', 'strategic_priorities']
};

export default { getPilotPortfolioInsightsPrompt, pilotPortfolioInsightsSchema };
