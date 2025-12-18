/**
 * Pilot analysis prompts
 * @module pilots/pilotAnalysis
 */

export const PILOT_ANALYSIS_SYSTEM_PROMPT = `You are an expert in analyzing pilot projects for Saudi municipal innovation. Provide strategic insights and recommendations.`;

export const createPilotAnalysisPrompt = (pilot) => `Analyze this pilot project for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Pilot: ${pilot.title_en}
Arabic Title: ${pilot.title_ar || 'N/A'}
Description: ${pilot.description_en}
Sector: ${pilot.sector}
Status: ${pilot.status}
Budget: ${pilot.budget} ${pilot.budget_currency || 'SAR'}
Timeline: ${pilot.start_date} to ${pilot.end_date}
Municipality: ${pilot.municipality_name || 'N/A'}
Provider: ${pilot.provider_name || 'N/A'}

Provide analysis covering:
1. Strategic Alignment Assessment
2. Implementation Progress Evaluation
3. Risk Analysis
4. Success Probability
5. Recommendations for Optimization
6. Scaling Potential`;

export const PILOT_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    strategic_alignment_en: { type: 'string' },
    strategic_alignment_ar: { type: 'string' },
    implementation_assessment_en: { type: 'string' },
    implementation_assessment_ar: { type: 'string' },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          severity: { type: 'string' },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' }
        }
      }
    },
    success_probability: { type: 'number' },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    scaling_potential_en: { type: 'string' },
    scaling_potential_ar: { type: 'string' }
  }
};
