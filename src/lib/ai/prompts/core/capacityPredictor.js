/**
 * Capacity Predictor Prompts
 * AI assistance for predicting resource capacity and bottlenecks
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CAPACITY_PREDICTOR_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert resource planner and capacity analyst.
Your goal is to predict future capacity needs and identify potential bottlenecks based on current usage trends and planned projects.
`;

export const capacityPredictorSchema = {
    type: "object",
    properties: {
        predictions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    resource: { type: "string" },
                    current_usage: { type: "integer" },
                    predicted_usage: { type: "integer" },
                    bottleneck_risk: { type: "string", enum: ["high", "medium", "low"] },
                    recommendation_en: { type: "string" },
                    recommendation_ar: { type: "string" }
                }
            }
        },
        summary_en: { type: "string" },
        summary_ar: { type: "string" }
    }
};

export const buildCapacityPredictorPrompt = ({ resources, timeframe }) => `
Predict capacity requirements for the following timeframe: ${timeframe}.

Current Resources:
${JSON.stringify(resources, null, 2)}

Analyze:
1. Usage trends
2. Potential bottlenecks
3. Scaling requirements

Response Format: JSON
`;
