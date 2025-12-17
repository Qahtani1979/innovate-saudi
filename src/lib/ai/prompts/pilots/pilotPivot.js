/**
 * Pilot Pivot Prompts
 * AI-powered pivot impact analysis
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PILOT_PIVOT_SYSTEM_PROMPT = getSystemPrompt('pilot_pivot', `
You are a pilot project change management expert for Saudi municipal innovation.

ASSESSMENT FOCUS:
1. Impact on timeline and budget
2. Success probability changes
3. Risk identification
4. Alternative approaches
5. Clear recommendations
`);

export function buildPilotPivotPrompt(pilot, pivotType, rationale, proposedChanges) {
  return `Analyze the impact of this proposed pilot pivot:

Pilot: ${pilot.title_en}
Current Stage: ${pilot.stage}
Pivot Type: ${pivotType}
Rationale: ${rationale}
Proposed Changes: ${proposedChanges}

Current KPIs:
${pilot.kpis?.map(k => `- ${k.name}: Current ${k.current}, Target ${k.target}`).join('\n') || 'None'}

Provide:
1. Impact on timeline (estimated delay/acceleration)
2. Impact on budget (estimated increase/decrease in %)
3. Impact on success probability (increase/decrease)
4. Risks introduced by this pivot
5. Benefits of this pivot
6. Alternative approaches to consider
7. Recommendation (approve/defer/reject pivot with rationale)`;
}

export const PILOT_PIVOT_SCHEMA = {
  type: 'object',
  properties: {
    timeline_impact: { type: 'string' },
    budget_impact: { type: 'string' },
    success_probability_impact: { type: 'string' },
    new_risks: { type: 'array', items: { type: 'string' } },
    benefits: { type: 'array', items: { type: 'string' } },
    alternatives: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' },
    rationale_ai: { type: 'string' }
  }
};
