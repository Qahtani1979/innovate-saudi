/**
 * Solution Matching AI prompts
 * For matching solutions to challenges
 */

export const SOLUTION_MATCHING_SYSTEM_PROMPT = `You are an expert at matching innovative solutions to municipal challenges.
Analyze solution capabilities against challenge requirements to identify optimal matches.
Consider technical fit, maturity level, implementation complexity, and cost-effectiveness.
All responses must be in valid JSON format.`;

export function buildSolutionMatchingPrompt(challenge, solutions) {
  return `Match these solutions to the challenge:

CHALLENGE:
Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}
Budget: ${challenge.budget_estimate ? `$${challenge.budget_estimate}` : 'Not specified'}
Priority: ${challenge.priority}
Requirements: ${challenge.desired_outcome_en || 'Not specified'}

CANDIDATE SOLUTIONS:
${solutions.map((s, i) => `
${i + 1}. ${s.name_en}
   - Provider: ${s.provider_name}
   - TRL: ${s.trl}
   - Sectors: ${s.sectors?.join(', ')}
   - Description: ${s.description_en?.substring(0, 200)}
`).join('\n')}

Rank solutions by fit and explain the matching rationale.`;
}

export const SOLUTION_MATCHING_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          solution_index: { type: "number" },
          solution_name: { type: "string" },
          match_score: { type: "number" },
          fit_analysis: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          gaps: { type: "array", items: { type: "string" } },
          implementation_considerations: { type: "string" },
          estimated_timeline: { type: "string" }
        }
      }
    },
    recommendation: { type: "string" },
    alternative_approaches: { type: "array", items: { type: "string" } }
  },
  required: ["matches", "recommendation"]
};

export const SOLUTION_EVALUATION_SYSTEM_PROMPT = `You are a solution evaluation expert.
Assess solutions for technical viability, scalability, and implementation readiness.
Provide balanced, objective evaluations considering both strengths and limitations.`;

export function buildSolutionEvaluationPrompt(solution, criteria = {}) {
  return `Evaluate this solution:

Solution: ${solution.name_en}
Provider: ${solution.provider_name}
TRL Level: ${solution.trl}
Description: ${solution.description_en}
Technical Specs: ${JSON.stringify(solution.technical_specifications || {})}
Use Cases: ${solution.use_cases?.join(', ') || 'Not specified'}

Evaluation Criteria:
${criteria.technical !== false ? '- Technical viability' : ''}
${criteria.scalability !== false ? '- Scalability potential' : ''}
${criteria.integration !== false ? '- Integration complexity' : ''}
${criteria.cost !== false ? '- Cost-effectiveness' : ''}
${criteria.sustainability !== false ? '- Long-term sustainability' : ''}

Provide a comprehensive evaluation with scores and recommendations.`;
}

export const SOLUTION_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    scores: {
      type: "object",
      properties: {
        technical_viability: { type: "number" },
        scalability: { type: "number" },
        integration_ease: { type: "number" },
        cost_effectiveness: { type: "number" },
        sustainability: { type: "number" }
      }
    },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    readiness_level: { type: "string", enum: ["ready", "needs_work", "not_ready"] }
  },
  required: ["overall_score", "scores", "strengths", "weaknesses"]
};
