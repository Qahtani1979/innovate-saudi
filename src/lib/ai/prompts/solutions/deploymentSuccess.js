/**
 * Solution Deployment AI prompts
 * For deployment tracking and ROI analysis
 */

export const DEPLOYMENT_SUCCESS_SYSTEM_PROMPT = `You are a solution deployment analyst.
Predict renewal probability and analyze deployment success factors.
Provide actionable recommendations for improving retention.
All responses must be in valid JSON format.`;

export function buildDeploymentSuccessPrompt(solution, deployments) {
  return `Predict renewal probability for solution deployments:

SOLUTION: ${solution.name_en}
Provider: ${solution.provider_name}
TRL: ${solution.trl}

DEPLOYMENTS:
${deployments?.map(d => `- ${d.municipality}: ${d.satisfaction}/5 rating, ${d.usage_rate}% usage`).join('\n') || 'No deployment data'}

Analyze success factors and predict renewal likelihood.`;
}

export const DEPLOYMENT_SUCCESS_SCHEMA = {
  type: "object",
  properties: {
    overall_health: { type: "string", enum: ["healthy", "at_risk", "critical"] },
    deployments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          municipality: { type: "string" },
          renewal_probability: { type: "number" },
          risk_factors: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    },
    success_factors: { type: "array", items: { type: "string" } },
    improvement_areas: { type: "array", items: { type: "string" } }
  },
  required: ["overall_health", "deployments"]
};

export const SOLUTION_ROI_SYSTEM_PROMPT = `You are a financial analyst specializing in innovation ROI.
Calculate and project ROI for solution implementations.
Consider both tangible and intangible benefits.`;

export function buildSolutionROIPrompt(solution, implementation) {
  return `Calculate ROI for solution implementation:

SOLUTION: ${solution.name_en}
Implementation Cost: ${implementation.cost || 'Not specified'}
Duration: ${implementation.duration_months || 12} months

BENEFITS IDENTIFIED:
${implementation.benefits?.map(b => `- ${b.description}: ${b.value || 'Qualitative'}`).join('\n') || 'Not quantified'}

OPERATIONAL SAVINGS:
${implementation.savings?.map(s => `- ${s.category}: ${s.amount}`).join('\n') || 'Not documented'}

Calculate comprehensive ROI with projections.`;
}

export const SOLUTION_ROI_SCHEMA = {
  type: "object",
  properties: {
    roi_percentage: { type: "number" },
    payback_period_months: { type: "number" },
    npv: { type: "number" },
    cost_breakdown: {
      type: "object",
      properties: {
        implementation: { type: "number" },
        training: { type: "number" },
        maintenance: { type: "number" },
        total: { type: "number" }
      }
    },
    benefit_breakdown: {
      type: "object",
      properties: {
        cost_savings: { type: "number" },
        efficiency_gains: { type: "number" },
        revenue_impact: { type: "number" },
        total: { type: "number" }
      }
    },
    projections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          year: { type: "number" },
          cumulative_roi: { type: "number" }
        }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["roi_percentage", "payback_period_months"]
};

export const IDEA_TO_SOLUTION_SYSTEM_PROMPT = `You are an innovation consultant.
Transform citizen ideas into structured solution entries.
Enhance with professional framing and market positioning.`;

export function buildIdeaToSolutionPrompt(idea) {
  return `Convert this citizen idea into a structured solution entry:

Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Votes: ${idea.votes_count || 0}

Transform into a market-ready solution with professional positioning.`;
}

export const IDEA_TO_SOLUTION_SCHEMA = {
  type: "object",
  properties: {
    solution_name_en: { type: "string" },
    solution_name_ar: { type: "string" },
    tagline_en: { type: "string" },
    tagline_ar: { type: "string" },
    description_en: { type: "string" },
    description_ar: { type: "string" },
    value_proposition: { type: "string" },
    target_sectors: { type: "array", items: { type: "string" } },
    use_cases: { type: "array", items: { type: "string" } },
    implementation_approach: { type: "string" },
    success_metrics: { type: "array", items: { type: "string" } }
  },
  required: ["solution_name_en", "description_en", "value_proposition"]
};
