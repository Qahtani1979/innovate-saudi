/**
 * Deployment Success Tracker Prompts
 * For predicting renewal probability for solution deployments
 * @module prompts/solutions/deploymentTracker
 */

export const DEPLOYMENT_TRACKER_SYSTEM_PROMPT = `You are a solution deployment analyst for Saudi municipal innovation.
Predict renewal probability and identify risk factors for active deployments.
Provide actionable recommendations to improve client retention.`;

export const buildDeploymentTrackerPrompt = ({ solution, deployments, avgSatisfaction, activeDeployments }) => {
  return `Predict renewal probability for solution deployments:

SOLUTION: ${solution.name_en || 'Solution'}
DEPLOYMENTS: ${deployments.length || 0}
AVG SATISFACTION: ${avgSatisfaction?.toFixed(1) || 'N/A'}/5
ACTIVE: ${activeDeployments || 0}

For each active deployment, predict:
1. Renewal probability (0-100%)
2. Key risk factors
3. Actions to improve renewal likelihood`;
};

export const DEPLOYMENT_TRACKER_SCHEMA = {
  type: "object",
  properties: {
    overall_renewal_probability: { type: "number", description: "Overall renewal probability 0-100" },
    deployment_predictions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          client: { type: "string", description: "Client name" },
          renewal_probability: { type: "number", description: "Renewal probability 0-100" },
          risk_factors: { type: "array", items: { type: "string" }, description: "List of risk factors" },
          recommendations: { type: "array", items: { type: "string" }, description: "Improvement recommendations" }
        },
        required: ["client", "renewal_probability"]
      },
      description: "Per-deployment predictions"
    }
  },
  required: ["overall_renewal_probability", "deployment_predictions"]
};

export default {
  system: DEPLOYMENT_TRACKER_SYSTEM_PROMPT,
  buildPrompt: buildDeploymentTrackerPrompt,
  schema: DEPLOYMENT_TRACKER_SCHEMA
};
