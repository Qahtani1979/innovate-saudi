/**
 * Report generation prompts
 * @module reports/generator
 */

export const REPORT_GENERATOR_SYSTEM_PROMPT = `You are an expert in generating professional reports for Saudi municipal innovation platforms aligned with Vision 2030.`;

export const createExecutiveReportPrompt = (data, reportType) => `Generate an executive ${reportType} report:

Data Summary:
${JSON.stringify(data, null, 2)}

Report Type: ${reportType}

Provide in BOTH English AND Arabic:
1. Executive Summary
2. Key Metrics & KPIs
3. Performance Analysis
4. Strategic Recommendations
5. Risk Assessment
6. Next Steps`;

export const EXECUTIVE_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    key_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric_name_en: { type: 'string' },
          metric_name_ar: { type: 'string' },
          value: { type: 'string' },
          trend: { type: 'string' }
        }
      }
    },
    analysis_en: { type: 'string' },
    analysis_ar: { type: 'string' },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    next_steps_en: { type: 'array', items: { type: 'string' } },
    next_steps_ar: { type: 'array', items: { type: 'string' } }
  }
};

export const createDashboardInsightsPrompt = (dashboardData) => `Generate insights for this dashboard data:

${JSON.stringify(dashboardData, null, 2)}

Provide:
1. Key observations (3-5)
2. Trends identified
3. Anomalies detected
4. Action recommendations`;

export const DASHBOARD_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    observations_en: { type: 'array', items: { type: 'string' } },
    observations_ar: { type: 'array', items: { type: 'string' } },
    trends: { type: 'array', items: { type: 'string' } },
    anomalies: { type: 'array', items: { type: 'string' } },
    recommendations_en: { type: 'array', items: { type: 'string' } },
    recommendations_ar: { type: 'array', items: { type: 'string' } }
  }
};
