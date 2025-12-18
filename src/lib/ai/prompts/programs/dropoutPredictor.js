/**
 * Dropout Risk Predictor Prompts
 * @module programs/dropoutPredictor
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const DROPOUT_PREDICTOR_SYSTEM_PROMPT = getSystemPrompt('dropout_predictor', `
You are a program retention specialist for Saudi Arabia's innovation ecosystem.
Your role is to predict participant dropout risk and recommend interventions.
Analyze engagement patterns, attendance, and participation metrics.
Provide actionable recommendations aligned with program success goals.
`);

/**
 * Build dropout risk prediction prompt
 * @param {Object} params - Program and participant details
 * @returns {string} Formatted prompt
 */
export function buildDropoutPredictorPrompt({ programName, participantCount, participantSamples }) {
  const sampleData = participantSamples
    .slice(0, 10)
    .map(p => `- ${p.startup_name}: Attendance ${p.attendance_rate || 85}%, Participation ${p.participation_score || 70}%, Last active: ${p.last_active_days || 3} days ago`)
    .join('\n');

  return `Predict dropout risk for program participants:

PROGRAM: ${programName || 'Accelerator'}
PARTICIPANTS: ${participantCount}

Sample data:
${sampleData}

For each at-risk participant, provide:
1. Dropout probability (0-100%)
2. Risk factors
3. Intervention recommendations`;
}

export const DROPOUT_PREDICTOR_SCHEMA = {
  type: "object",
  properties: {
    at_risk_count: { type: "number" },
    predictions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          participant: { type: "string" },
          dropout_probability: { type: "number", minimum: 0, maximum: 100 },
          risk_factors: { type: "array", items: { type: "string" } },
          interventions: { type: "array", items: { type: "string" } }
        },
        required: ["participant", "dropout_probability"]
      }
    }
  },
  required: ["at_risk_count", "predictions"]
};

export const DROPOUT_PREDICTOR_PROMPTS = {
  systemPrompt: DROPOUT_PREDICTOR_SYSTEM_PROMPT,
  buildPrompt: buildDropoutPredictorPrompt,
  schema: DROPOUT_PREDICTOR_SCHEMA
};
