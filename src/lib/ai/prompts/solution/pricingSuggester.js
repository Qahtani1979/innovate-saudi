/**
 * AI Pricing Suggester Prompts
 * Provides intelligent pricing recommendations for solutions
 * @module solution/pricingSuggester
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate pricing analysis prompt
 */
export function generatePricingAnalysisPrompt(solution, similarSolutions = []) {
  return `Analyze pricing for this solution in Saudi municipal market:

Solution: ${solution?.name_en || 'Unknown'}
Maturity: ${solution?.maturity_level || 'N/A'}
TRL: ${solution?.trl || 'N/A'}
Features: ${solution?.features?.join(', ') || 'None specified'}
Sectors: ${solution?.sectors?.join(', ') || 'None specified'}
Deployment Options: ${solution?.deployment_options?.join(', ') || 'N/A'}

Similar solutions pricing:
${similarSolutions.map(s => 
  `- ${s.name_en}: ${s.pricing_model} ${s.pricing_details?.monthly_cost ? '('+s.pricing_details.monthly_cost+' SAR/mo)' : ''}`
).join('\n') || 'No similar solutions found'}

Provide BILINGUAL pricing intelligence (AR+EN):
1. Recommended pricing model (subscription/one-time/usage-based/custom)
2. Price range (min-max in SAR)
3. Justification for pricing strategy
4. ROI value proposition for municipalities
5. Competitive positioning (premium/mid-market/value)`;
}

/**
 * Get pricing analysis schema
 */
export function getPricingAnalysisSchema() {
  return {
    type: 'object',
    properties: {
      pricing_model: { 
        type: 'string',
        enum: ['subscription', 'one-time', 'usage-based', 'custom', 'freemium', 'tiered']
      },
      price_range: {
        type: 'object',
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          currency: { type: 'string' }
        }
      },
      justification: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      },
      roi_value: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      },
      positioning: { 
        type: 'string',
        enum: ['premium', 'mid-market', 'value', 'enterprise']
      },
      recommended_tiers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            features: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  };
}

/**
 * Get system prompt for pricing analysis
 */
export function getPricingSystemPrompt() {
  return getSystemPrompt('pricing-analyst');
}

export const PRICING_SUGGESTER_CONFIG = {
  name: 'pricing-suggester',
  version: '1.0.0',
  description: 'AI-powered pricing recommendations for municipal solutions'
};
