/**
 * Solution Success Predictor Prompts
 * Predicts pilot success probability based on historical patterns
 * @module solution/successPredictor
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate success prediction prompt
 */
export function generateSuccessPredictionPrompt(solution, challenge = null) {
  return `Predict the success probability of this solution in a municipal pilot based on historical patterns.

SOLUTION:
Name: ${solution?.name_en || 'Unknown'}
Provider: ${solution?.provider_name || 'Unknown'} (${solution?.provider_type || 'N/A'})
Maturity: ${solution?.maturity_level || 'N/A'}
TRL: ${solution?.trl || 'N/A'}
Deployment Count: ${solution?.deployment_count || 0}
Success Rate: ${solution?.success_rate || 0}%
Average Rating: ${solution?.average_rating || 'N/A'}
Total Reviews: ${solution?.total_reviews || 0}

${challenge ? `CHALLENGE:
Title: ${challenge.title_en || challenge.title_ar}
Sector: ${challenge.sector || 'N/A'}
Priority: ${challenge.priority || 'N/A'}
Impact Score: ${challenge.impact_score || 'N/A'}
Affected Population: ${challenge.affected_population_size || 'N/A'}` : 'No specific challenge context provided'}

Analyze:
1. Success probability (0-100%) with confidence interval
2. Key success factors (what increases odds)
3. Risk factors (what decreases odds)
4. Similar successful patterns from historical data
5. Recommended preparation steps
6. Timeline prediction (best/likely/worst case)
7. Budget risk assessment

Provide data-driven prediction with specific reasoning.`;
}

/**
 * Get success prediction schema
 */
export function getSuccessPredictionSchema() {
  return {
    type: 'object',
    properties: {
      success_probability: { type: 'number' },
      confidence_level: { 
        type: 'string', 
        enum: ['low', 'medium', 'high'] 
      },
      success_factors: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      risk_factors: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      similar_patterns: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      preparation_steps: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      timeline_prediction: {
        type: 'object',
        properties: {
          best_case_months: { type: 'number' },
          likely_months: { type: 'number' },
          worst_case_months: { type: 'number' }
        }
      },
      budget_risk: { 
        type: 'string', 
        enum: ['low', 'medium', 'high'] 
      },
      overall_recommendation: { type: 'string' },
      key_milestones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            milestone: { type: 'string' },
            timeline: { type: 'string' },
            critical: { type: 'boolean' }
          }
        }
      }
    }
  };
}

/**
 * Get system prompt for success prediction
 */
export function getSuccessPredictionSystemPrompt() {
  return getSystemPrompt('pilot-success-analyst');
}

export const SUCCESS_PREDICTOR_CONFIG = {
  name: 'success-predictor',
  version: '1.0.0',
  description: 'AI-powered pilot success prediction for municipal solutions'
};
