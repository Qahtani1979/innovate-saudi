/**
 * Program Success Predictor Prompt
 * Predicts program success metrics and provides recommendations
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build success predictor prompt
 */
export function buildSuccessPredictorPrompt(program) {
  return `${SAUDI_CONTEXT}

You are an AI program analytics specialist for Saudi Arabia's municipal innovation programs.

PROGRAM DETAILS:
- Name: ${program?.name_en || 'Innovation Program'}
- Type: ${program?.program_type || 'Accelerator'}
- Duration: ${program?.duration_weeks || 12} weeks
- Cohort Size: ${program?.target_participants?.max_participants || 'Not specified'}
- Funding Pool: ${program?.funding_details?.total_pool || 0} SAR
- Curriculum Weeks: ${program?.curriculum?.length || 0} planned
- Focus Areas: ${program?.focus_areas?.join(', ') || 'General innovation'}
- Cohort Number: ${program?.cohort_number || 1}

TASK: Predict success metrics with confidence scores.

PREDICT:
1. Graduation Rate (0-100%) - Expected completion percentage
2. Post-Program Employment Rate (0-100%) - Success after program
3. Participant Satisfaction (1-10) - Expected satisfaction score
4. Key Success Factors - What will drive success
5. Risk Factors - What could cause problems
6. Recommendations - Actionable improvements

${LANGUAGE_REQUIREMENTS}

Base predictions on program structure, Saudi market context, and best practices.`;
}

/**
 * Get response schema for success predictions
 */
export function getSuccessPredictorSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      graduation_rate: { type: 'number', description: 'Expected completion % 0-100' },
      graduation_confidence: { type: 'number', description: 'Confidence 0-100' },
      post_program_employment_rate: { type: 'number', description: 'Success rate % 0-100' },
      employment_confidence: { type: 'number', description: 'Confidence 0-100' },
      participant_satisfaction: { type: 'number', description: 'Expected satisfaction 1-10' },
      satisfaction_confidence: { type: 'number', description: 'Confidence 0-100' },
      key_success_factors: { type: 'array', items: { type: 'string' }, description: 'Success drivers' },
      key_success_factors_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic success factors' },
      risk_factors: { type: 'array', items: { type: 'string' }, description: 'Risk factors' },
      risk_factors_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic risk factors' },
      recommendations: { type: 'array', items: { type: 'string' }, description: 'Recommendations' },
      recommendations_ar: { type: 'array', items: { type: 'string' }, description: 'Arabic recommendations' }
    },
    required: ['graduation_rate', 'graduation_confidence', 'post_program_employment_rate', 'employment_confidence', 'participant_satisfaction', 'satisfaction_confidence', 'key_success_factors', 'risk_factors', 'recommendations']
  });
}

export const SUCCESS_PREDICTOR_SYSTEM_PROMPT = `You are an AI program analytics specialist for Saudi Arabia's municipal innovation programs. You predict program outcomes using data-driven analysis and provide actionable recommendations. Always provide bilingual responses.`;
