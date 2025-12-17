/**
 * Success Predictor Prompt
 * Used by: AISuccessPredictor.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildSuccessPredictorPrompt = (pilot) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are predicting the success probability for a Saudi municipal innovation pilot.

## PILOT DETAILS

### Basic Information
- Title: ${pilot.title_en || pilot.name_en}
- Sector: ${pilot.sector}
- Duration: ${pilot.duration_weeks} weeks
- Budget: ${pilot.budget} ${pilot.budget_currency || 'SAR'}
- TRL Level: ${pilot.trl_current || pilot.trl_start || 'N/A'}
- Stage: ${pilot.stage}
- Municipality: ${pilot.municipality_id}

### KPIs
${JSON.stringify(pilot.kpis || [], null, 2)}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Consider factors:
1. Historical success rates in this sector
2. Budget adequacy for scope
3. KPI ambition vs. baseline
4. Organizational capacity
5. Technology readiness

Provide:
- Success probability (0-100)
- Confidence level (low/medium/high)
- Key strengths (3-5 points)
- Risk factors (2-4 points)
- Recommendations for improvement
- Comparison to similar pilots
- Predicted outcomes for KPIs, timeline, and budget`;
};

export const successPredictorSchema = {
  type: 'object',
  required: ['success_probability', 'confidence_level'],
  properties: {
    success_probability: { type: 'number', minimum: 0, maximum: 100 },
    confidence_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    key_strengths: { type: 'array', items: { type: 'string' } },
    risk_factors: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    comparison_to_similar_pilots: { type: 'string' },
    predicted_outcomes: {
      type: 'object',
      properties: {
        kpi_achievement: { type: 'string' },
        timeline_adherence: { type: 'string' },
        budget_efficiency: { type: 'string' }
      }
    }
  }
};

export const SUCCESS_PREDICTOR_SYSTEM_PROMPT = `You are a pilot success prediction analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You analyze pilot project characteristics and predict success probability based on historical patterns, sector benchmarks, and risk factors in the Saudi municipal innovation context.`;
