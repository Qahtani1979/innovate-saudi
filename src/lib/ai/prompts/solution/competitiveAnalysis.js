/**
 * Competitive Analysis AI Prompts
 * Provides market positioning and competitive intelligence
 * @module solution/competitiveAnalysis
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate competitive analysis prompt
 */
export function generateCompetitiveAnalysisPrompt(solution, competitors = []) {
  return `Perform competitive analysis for this solution in BOTH English and Arabic:

Solution: ${solution?.name_en || 'Unknown'}
Provider: ${solution?.provider_name || 'Unknown'}
Maturity: ${solution?.maturity_level || 'N/A'}
Pricing: ${solution?.pricing_model || 'N/A'}
Features: ${solution?.features?.join(', ') || 'None specified'}
Sectors: ${solution?.sectors?.join(', ') || 'None specified'}
Success Rate: ${solution?.success_rate || 0}%
Deployment Count: ${solution?.deployment_count || 0}

Competitors:
${competitors.map(c => 
  `- ${c.name_en} (${c.provider_name}): ${c.maturity_level}, ${c.pricing_model}, Success: ${c.success_rate || 0}%`
).join('\n') || 'No direct competitors identified'}

Provide bilingual analysis:
1. Market positioning (strengths/weaknesses vs competitors)
2. Unique differentiators
3. Pricing competitiveness
4. Target market fit
5. Recommendations for improvement
6. Competitive score (0-100)`;
}

/**
 * Get competitive analysis schema
 */
export function getCompetitiveAnalysisSchema() {
  return {
    type: 'object',
    properties: {
      positioning: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      },
      differentiators: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      pricing_analysis: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      },
      market_fit: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      },
      recommendations: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      competitive_score: { type: 'number' },
      strengths: {
        type: 'array',
        items: { type: 'string' }
      },
      weaknesses: {
        type: 'array',
        items: { type: 'string' }
      },
      opportunities: {
        type: 'array',
        items: { type: 'string' }
      },
      threats: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  };
}

/**
 * Get system prompt for competitive analysis
 */
export function getCompetitiveAnalysisSystemPrompt() {
  return getSystemPrompt('market-analyst');
}

export const COMPETITIVE_ANALYSIS_CONFIG = {
  name: 'competitive-analysis',
  version: '1.0.0',
  description: 'AI-powered competitive intelligence for municipal solutions'
};
