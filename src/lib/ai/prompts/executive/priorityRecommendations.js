/**
 * Priority Recommendations Prompt
 * Used by: PriorityRecommendations.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildPriorityRecommendationsPrompt = (stateData) => {
  const {
    tier1Challenges = 0,
    approvedNoPilot = 0,
    activePilots = 0,
    readyToScale = 0,
    lowMIIMunicipalities = 0
  } = stateData;

  return `${SAUDI_CONTEXT.COMPACT}

As Saudi Arabia's national innovation strategist, recommend strategic priorities for the next quarter.

## CURRENT STATE

- **Tier 1 Challenges:** ${tier1Challenges}
- **Approved Challenges (no pilot):** ${approvedNoPilot}
- **Active Pilots:** ${activePilots}
- **Pilots Ready to Scale:** ${readyToScale}
- **Low MII Municipalities (<50):** ${lowMIIMunicipalities}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## PRIORITY REQUIREMENTS

Provide **5 strategic priorities** with:

1. **Priority Title:** Clear, actionable name
2. **Rank:** 1-5 priority order
3. **Rationale:** Why this matters now (2-3 sentences)
4. **Quick Wins:** 2-3 immediate actions
5. **Resources Needed:** low / medium / high
6. **Expected Impact:** Quantified if possible
7. **Timeline:** Weeks to achieve
8. **Related Entities:** Connected challenges, pilots, or municipalities

Focus on:
- Accelerating high-impact pilots
- Supporting struggling municipalities
- Clearing pipeline bottlenecks
- Maximizing Vision 2030 alignment`;
};

export const priorityRecommendationsSchema = {
  type: 'object',
  required: ['priorities'],
  properties: {
    priorities: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'rank', 'rationale', 'quick_wins', 'resources_needed', 'expected_impact', 'timeline_weeks'],
        properties: {
          title: { type: 'string' },
          rank: { type: 'number' },
          rationale: { type: 'string' },
          quick_wins: { type: 'array', items: { type: 'string' } },
          resources_needed: { type: 'string', enum: ['low', 'medium', 'high'] },
          expected_impact: { type: 'string' },
          timeline_weeks: { type: 'number' },
          related_entities: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

export const PRIORITY_RECOMMENDATIONS_SYSTEM_PROMPT = `You are a national innovation strategist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify and prioritize strategic actions to maximize innovation impact across the Kingdom.`;
