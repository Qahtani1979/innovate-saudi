/**
 * Startup Churn Predictor Prompts
 * @module startup/churnPredictor
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CHURN_PREDICTOR_SYSTEM_PROMPT = getSystemPrompt('startup_churn_prediction');

export const buildChurnPredictorPrompt = (startup, solutions, activities) => `Predict churn risk for this startup on municipal innovation platform:

STARTUP: ${startup?.name_en}
DAYS ACTIVE: ${startup?.created_date ? Math.floor((new Date() - new Date(startup.created_date)) / (1000*60*60*24)) : 'N/A'}
SOLUTIONS: ${solutions.length}
PILOT SUCCESS RATE: ${startup?.pilot_success_rate || 0}%
MUNICIPAL CLIENTS: ${startup?.municipal_clients_count || 0}
RECENT ACTIVITY (30d): ${activities.length} events
VERIFICATION: ${startup?.is_verified ? 'Yes' : 'No'}

Analyze churn risk factors:
1. Low platform engagement
2. No successful pilots
3. No municipal clients
4. Declining activity
5. Unverified status

Return: churn_risk (low/medium/high), churn_probability (0-100), risk_factors, retention_recommendations`;

export const CHURN_PREDICTOR_SCHEMA = {
  type: "object",
  properties: {
    churn_risk: { type: "string" },
    churn_probability: { type: "number" },
    risk_factors: { type: "array", items: { type: "string" } },
    retention_recommendations: { type: "array", items: { type: "string" } }
  },
  required: ['churn_risk', 'churn_probability']
};

export const CHURN_PREDICTOR_PROMPTS = {
  systemPrompt: CHURN_PREDICTOR_SYSTEM_PROMPT,
  buildPrompt: buildChurnPredictorPrompt,
  schema: CHURN_PREDICTOR_SCHEMA
};

export default CHURN_PREDICTOR_PROMPTS;
