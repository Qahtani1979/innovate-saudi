/**
 * Cross-Journey Insights Prompts
 * @module bonus/crossJourney
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CROSS_JOURNEY_SYSTEM_PROMPT = getSystemPrompt('cross_journey', `
You are an innovation ecosystem analyst for Saudi Arabia's municipal platform.
Your role is to identify patterns across all innovation journeys (challenges, pilots, solutions, R&D).
Detect bottlenecks, success patterns, and strategic opportunities across the ecosystem.
`);

/**
 * Build cross-journey analysis prompt
 * @param {Object} params - Journey data
 * @returns {string} Formatted prompt
 */
export function buildCrossJourneyPrompt({ challenges, pilots, solutions, rdProjects }) {
  return `Analyze cross-journey patterns and insights:

CHALLENGES: ${challenges?.length || 0} (${challenges?.filter(c => c.status === 'approved').length || 0} approved)
PILOTS: ${pilots?.length || 0} (${pilots?.filter(p => p.stage === 'active').length || 0} active)
SOLUTIONS: ${solutions?.length || 0}
R&D PROJECTS: ${rdProjects?.length || 0}

Challenge Sectors: ${[...new Set(challenges?.map(c => c.sector) || [])].join(', ') || 'N/A'}
Pilot Success Rate: ${pilots?.filter(p => p.recommendation === 'scale').length || 0}/${pilots?.length || 0}

Identify:
1. Cross-sector patterns (recurring themes across sectors)
2. Innovation bottlenecks (where things get stuck)
3. Underutilized resources (labs, programs, partnerships)
4. Success patterns (what works consistently)
5. Strategic recommendations (3-5 actionable insights)`;
}

export const CROSS_JOURNEY_SCHEMA = {
  type: "object",
  properties: {
    cross_sector_patterns: { type: "array", items: { type: "string" } },
    bottlenecks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          stage: { type: "string" },
          description: { type: "string" },
          impact: { type: "string" }
        }
      }
    },
    underutilized: { type: "array", items: { type: "string" } },
    success_patterns: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["cross_sector_patterns", "bottlenecks", "recommendations"]
};

export const CROSS_JOURNEY_PROMPTS = {
  systemPrompt: CROSS_JOURNEY_SYSTEM_PROMPT,
  buildPrompt: buildCrossJourneyPrompt,
  schema: CROSS_JOURNEY_SCHEMA
};
