/**
 * Solution Matcher Prompts
 * @module matchmaker/solutionMatcher
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SOLUTION_MATCHER_SYSTEM_PROMPT = getSystemPrompt('solution_matcher', `
You are a solution matching specialist for Saudi Arabia's municipal innovation platform.
Your role is to match challenges with suitable solutions from the solution catalog.
Consider technical fit, budget alignment, and municipal readiness.
`);

export function buildSolutionMatcherPrompt({ challenge, solutions }) {
  return `Match this challenge with suitable solutions:

CHALLENGE: ${challenge.title_en}
DESCRIPTION: ${challenge.description_en}
SECTOR: ${challenge.sector}
BUDGET: ${challenge.budget_estimate || 'N/A'}
PRIORITY: ${challenge.priority}

AVAILABLE SOLUTIONS (${solutions.length}):
${solutions.slice(0, 10).map(s => `
- ${s.name_en}: ${s.description_en?.substring(0, 100)}
  Sector: ${s.sector}, TRL: ${s.technology_readiness_level}
`).join('\n')}

Provide:
1. Top 3 matching solutions with scores
2. Fit analysis for each
3. Implementation considerations
4. Alternative approaches if no perfect match`;
}

export const SOLUTION_MATCHER_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          solution_name: { type: "string" },
          match_score: { type: "number" },
          fit_analysis: { type: "string" },
          implementation_notes: { type: "string" },
          estimated_timeline: { type: "string" }
        }
      }
    },
    alternative_approaches: { type: "array", items: { type: "string" } },
    overall_recommendation: { type: "string" }
  },
  required: ["matches", "overall_recommendation"]
};

export const SOLUTION_MATCHER_PROMPTS = {
  systemPrompt: SOLUTION_MATCHER_SYSTEM_PROMPT,
  buildPrompt: buildSolutionMatcherPrompt,
  schema: SOLUTION_MATCHER_SCHEMA
};
