/**
 * Sandbox enhancement prompts
 * @module sandbox/enhance
 */

export const SANDBOX_ENHANCE_SYSTEM_PROMPT = `You are an expert in regulatory sandbox design for Saudi municipal innovation. Enhance sandbox proposals for maximum effectiveness and compliance.`;

export const createSandboxEnhancePrompt = (formData) => `Enhance this regulatory sandbox proposal:

Sandbox Name: ${formData.name_en}
Arabic Name: ${formData.name_ar || 'N/A'}
Description: ${formData.description_en}
Regulatory Framework: ${formData.regulatory_framework || 'N/A'}
Focus Area: ${formData.focus_area || 'N/A'}
Duration: ${formData.duration_months || 'TBD'} months

Enhance with:
1. Refined objectives (bilingual)
2. Success metrics
3. Regulatory exemptions needed
4. Stakeholder engagement plan
5. Risk mitigation framework
6. Exit criteria`;

export const SANDBOX_ENHANCE_SCHEMA = {
  type: 'object',
  properties: {
    enhanced_objectives_en: { type: 'array', items: { type: 'string' } },
    enhanced_objectives_ar: { type: 'array', items: { type: 'string' } },
    success_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric_en: { type: 'string' },
          metric_ar: { type: 'string' },
          target: { type: 'string' },
          measurement_method: { type: 'string' }
        }
      }
    },
    regulatory_exemptions: { type: 'array', items: { type: 'string' } },
    stakeholder_plan_en: { type: 'string' },
    stakeholder_plan_ar: { type: 'string' },
    risk_framework: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' }
        }
      }
    },
    exit_criteria_en: { type: 'array', items: { type: 'string' } },
    exit_criteria_ar: { type: 'array', items: { type: 'string' } }
  }
};

export const createSandboxAnalysisPrompt = (sandboxes) => `Analyze these regulatory sandboxes for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Sandboxes: ${JSON.stringify(sandboxes)}

Provide analysis covering:
1. Portfolio Overview
2. Sector Distribution
3. Success Patterns
4. Common Challenges
5. Recommendations for New Sandboxes
6. Scaling Opportunities`;

export const SANDBOX_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    portfolio_overview_en: { type: 'string' },
    portfolio_overview_ar: { type: 'string' },
    sector_insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sector: { type: 'string' },
          insight_en: { type: 'string' },
          insight_ar: { type: 'string' }
        }
      }
    },
    success_patterns_en: { type: 'array', items: { type: 'string' } },
    success_patterns_ar: { type: 'array', items: { type: 'string' } },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } }
  }
};
