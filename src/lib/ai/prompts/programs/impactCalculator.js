/**
 * Municipal Impact Calculator Prompts
 * @module programs/impactCalculator
 */

export const IMPACT_CALCULATOR_SYSTEM_PROMPT = `You are an expert in municipal innovation program impact assessment for Saudi Arabia. Calculate and project the capacity building impact of innovation programs on municipal operations.`;

export const buildImpactCalculatorPrompt = (program, scope, duration) => `Analyze the municipal capacity impact of this innovation program for Saudi municipalities:

Program: ${program.name_en}
Type: ${program.program_type || 'Innovation'}
Sectors: ${program.target_sectors?.join(', ') || 'Multi-sector'}
Scope: ${scope} municipalities
Duration: ${duration} months
Description: ${program.description_en || 'N/A'}
Objectives: ${program.objectives?.join(', ') || 'N/A'}

Calculate projected impact in BOTH English AND Arabic:
1. Capacity Building Score (0-100)
2. Innovation Readiness Improvement
3. Staff Competency Gains
4. Process Efficiency Improvements
5. Sustainability Metrics`;

export const IMPACT_CALCULATOR_SCHEMA = {
  type: 'object',
  properties: {
    capacity_score: { type: 'number', minimum: 0, maximum: 100 },
    innovation_readiness: {
      type: 'object',
      properties: {
        current: { type: 'number' },
        projected: { type: 'number' },
        improvement_en: { type: 'string' },
        improvement_ar: { type: 'string' }
      }
    },
    staff_competency: {
      type: 'object',
      properties: {
        skills_gained_en: { type: 'array', items: { type: 'string' } },
        skills_gained_ar: { type: 'array', items: { type: 'string' } },
        training_hours: { type: 'number' }
      }
    },
    process_efficiency: {
      type: 'object',
      properties: {
        time_saved_percent: { type: 'number' },
        cost_reduction_percent: { type: 'number' },
        details_en: { type: 'string' },
        details_ar: { type: 'string' }
      }
    },
    sustainability: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        factors_en: { type: 'array', items: { type: 'string' } },
        factors_ar: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  required: ['capacity_score', 'innovation_readiness', 'sustainability']
};
