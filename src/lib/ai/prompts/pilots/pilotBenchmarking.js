/**
 * Pilot Benchmarking AI Prompt
 * Compares pilot performance against similar pilots
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generates prompt for pilot benchmarking
 * @param {Object} pilot - Current pilot data
 * @param {Array} similarPilots - Array of similar completed pilots
 * @returns {string} Formatted prompt
 */
export function getPilotBenchmarkingPrompt(pilot, similarPilots) {
  const context = similarPilots.map(p => ({
    title: p.title_en,
    duration: p.duration_months,
    budget: p.budget_allocated,
    kpi_achievement: p.overall_score
  }));

  return `${SAUDI_CONTEXT.MUNICIPAL}

Compare this pilot against similar completed pilots.

CURRENT PILOT:
- Title: ${pilot.title_en}
- Duration: ${pilot.duration_months} months
- Budget: ${pilot.budget_allocated} SAR
- Current Score: ${pilot.overall_score}

SIMILAR PILOTS (${similarPilots.length} total):
${JSON.stringify(context, null, 2)}

Provide:
1. PERFORMANCE PERCENTILE: Where this pilot ranks (e.g., "Top 25% in efficiency")
2. STRENGTHS: Areas where this pilot outperforms peers
3. WEAKNESSES: Areas where this pilot underperforms
4. RECOMMENDATIONS: Specific actions based on what top performers did

Focus on actionable insights that can improve pilot outcomes.`;
}

/**
 * JSON schema for benchmarking response
 */
export const pilotBenchmarkingSchema = {
  type: 'object',
  properties: {
    percentile: { 
      type: 'string',
      description: 'Performance ranking description'
    },
    strengths: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Areas of strong performance'
    },
    weaknesses: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Areas needing improvement'
    },
    recommendations: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Best practice recommendations'
    }
  },
  required: ['percentile', 'strengths', 'weaknesses', 'recommendations']
};

export default { getPilotBenchmarkingPrompt, pilotBenchmarkingSchema };
