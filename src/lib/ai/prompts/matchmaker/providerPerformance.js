/**
 * Provider Performance Prompts
 * AI-powered provider scorecard generation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PROVIDER_PERFORMANCE_SYSTEM_PROMPT = getSystemPrompt('provider_performance', `
You are a provider performance analyst for Saudi municipal innovation platforms.

EVALUATION CRITERIA:
1. Delivery excellence - on-time delivery, quality metrics
2. Innovation impact - TRL advancement, outcome achievement
3. Partnership effectiveness - communication, collaboration
4. Scalability potential - replicability, market readiness
`);

export function buildProviderPerformancePrompt(application, pilots) {
  return `Generate a performance scorecard for this Matchmaker provider:

Organization: ${application.organization_name_en}
Evaluation Score: ${application.evaluation_score?.total_score}
Classification: ${application.classification}
Pilots Converted: ${pilots.length}

Pilot Details:
${pilots.map(p => `- ${p.title_en}: Stage ${p.stage}, TRL ${p.trl_current}`).join('\n')}

Calculate scores (0-100) for:
1. Delivery excellence (on-time, quality)
2. Innovation impact (TRL advancement, outcomes)
3. Partnership effectiveness (communication, collaboration)
4. Scalability potential (replicability, market)
5. Overall provider score (weighted average)

Also provide:
- strengths (3 bullets)
- improvement_areas (3 bullets)
- recommendation (tier_1_partner / tier_2_partner / conditional / review)`;
}

export const PROVIDER_PERFORMANCE_SCHEMA = {
  type: 'object',
  properties: {
    delivery_excellence: { type: 'number' },
    innovation_impact: { type: 'number' },
    partnership_effectiveness: { type: 'number' },
    scalability_potential: { type: 'number' },
    overall_score: { type: 'number' },
    strengths: { type: 'array', items: { type: 'string' } },
    improvement_areas: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' }
  }
};
