/**
 * Strategic KPI Prompts
 * Centralized prompts for KPI tracking and analysis
 * @module prompts/kpi/strategicKPI
 */

export const STRATEGIC_KPI_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    anomalies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kpi_en: { type: 'string' },
          kpi_ar: { type: 'string' },
          anomaly_en: { type: 'string' },
          anomaly_ar: { type: 'string' },
          severity: { type: 'string' }
        }
      }
    },
    forecasts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kpi_en: { type: 'string' },
          kpi_ar: { type: 'string' },
          forecast_en: { type: 'string' },
          forecast_ar: { type: 'string' },
          confidence: { type: 'string' }
        }
      }
    },
    correlations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          correlation_en: { type: 'string' },
          correlation_ar: { type: 'string' },
          strength: { type: 'string' }
        }
      }
    },
    interventions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kpi_en: { type: 'string' },
          kpi_ar: { type: 'string' },
          strategy_en: { type: 'string' },
          strategy_ar: { type: 'string' },
          urgency: { type: 'string' }
        }
      }
    }
  }
};

export const STRATEGIC_KPI_INSIGHTS_PROMPT_TEMPLATE = (context) => `
Analyze strategic KPI performance for Saudi municipal innovation platform:

KPI Performance:
${JSON.stringify(context.kpiData, null, 2)}

Active Pilots: ${context.activePilots}
Challenges: ${context.totalChallenges}

Generate bilingual AI insights:
1. **Anomaly Detection** - Unusual KPI movements or patterns
2. **Predictive Forecasting** - Trajectory predictions for next 3-6 months
3. **Correlation Analysis** - Which KPIs move together, interdependencies
4. **Target Adjustment** - Suggest realistic target revisions if needed
5. **Alert Recommendations** - When should stakeholders be notified
6. **Intervention Strategies** - Specific actions to improve at-risk KPIs`;

export const STRATEGIC_KPI_PROMPT = {
  system: `You are an expert KPI analyst for Saudi municipal innovation platforms.
Analyze KPI performance data and provide actionable insights aligned with Vision 2030.
Provide bilingual (English/Arabic) analysis.`,
  schema: STRATEGIC_KPI_INSIGHTS_SCHEMA
};

export default {
  STRATEGIC_KPI_INSIGHTS_SCHEMA,
  STRATEGIC_KPI_INSIGHTS_PROMPT_TEMPLATE,
  STRATEGIC_KPI_PROMPT
};
