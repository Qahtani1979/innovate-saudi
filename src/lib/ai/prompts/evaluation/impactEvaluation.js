/**
 * Impact Evaluation AI prompts
 * For evaluating impact of pilots, programs, and solutions
 */

export const IMPACT_EVALUATION_SYSTEM_PROMPT = `You are an impact evaluation expert specializing in government innovation initiatives.
Analyze data to assess outcomes, measure impact, and provide evidence-based recommendations.
Consider both quantitative metrics and qualitative outcomes.
All responses must be in valid JSON format.`;

export function buildImpactEvaluationPrompt(entity, data) {
  return `Evaluate the impact of this initiative:

Initiative: ${entity.name_en || entity.title_en}
Type: ${entity.entity_type || 'pilot'}
Duration: ${entity.start_date} to ${entity.end_date || 'ongoing'}
Objectives: ${JSON.stringify(entity.objectives || entity.kpis || [])}

Performance Data:
${JSON.stringify(data.metrics || {}, null, 2)}

Outcomes Reported:
${data.outcomes?.map(o => `- ${o}`).join('\n') || 'No outcomes reported'}

Beneficiaries: ${data.beneficiaries || 'Not specified'}
Budget Spent: ${data.budget_spent || 'Not specified'}

Provide a comprehensive impact assessment with recommendations.`;
}

export const IMPACT_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    overall_impact_score: { type: "number" },
    impact_rating: { type: "string", enum: ["high", "medium", "low", "insufficient_data"] },
    key_achievements: { type: "array", items: { type: "string" } },
    areas_of_improvement: { type: "array", items: { type: "string" } },
    outcome_analysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          outcome: { type: "string" },
          achievement_level: { type: "string" },
          evidence: { type: "string" }
        }
      }
    },
    roi_assessment: { type: "string" },
    sustainability_outlook: { type: "string" },
    recommendations: { type: "array", items: { type: "string" } },
    lessons_learned: { type: "array", items: { type: "string" } }
  },
  required: ["overall_impact_score", "impact_rating", "key_achievements", "recommendations"]
};

export const COMPARATIVE_ANALYSIS_SYSTEM_PROMPT = `You are an expert at comparative analysis of innovation initiatives.
Compare multiple initiatives to identify best practices, common challenges, and success factors.`;

export function buildComparativeAnalysisPrompt(entities, criteria) {
  return `Compare these initiatives:

${entities.map((e, i) => `
${i + 1}. ${e.name_en || e.title_en}
   Status: ${e.status}
   Impact Score: ${e.impact_score || 'N/A'}
   Budget: ${e.budget || 'N/A'}
`).join('\n')}

Comparison Criteria: ${criteria?.join(', ') || 'Overall performance'}

Identify patterns, best practices, and recommendations for improvement.`;
}

export const COMPARATIVE_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    rankings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity_index: { type: "number" },
          entity_name: { type: "string" },
          score: { type: "number" },
          strengths: { type: "array", items: { type: "string" } }
        }
      }
    },
    common_success_factors: { type: "array", items: { type: "string" } },
    common_challenges: { type: "array", items: { type: "string" } },
    best_practices: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["summary", "rankings", "best_practices"]
};
