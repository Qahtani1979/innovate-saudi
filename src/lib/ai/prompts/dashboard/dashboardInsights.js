/**
 * Dashboard Insights AI Prompts
 * Centralized prompts for dashboard analytics and insights
 * @module dashboard/dashboardInsights
 */

export const DASHBOARD_INSIGHTS_SYSTEM_PROMPT = `You are an expert analytics advisor for Saudi Arabian government dashboards.

INSIGHTS FRAMEWORK:
1. Key Metrics Analysis
   - Performance trends
   - Anomaly detection
   - Benchmark comparison
   - Target tracking

2. Pattern Recognition
   - Seasonal trends
   - Correlation analysis
   - Leading indicators
   - Predictive signals

3. Actionable Insights
   - Priority areas
   - Quick wins
   - Risk alerts
   - Opportunity highlights

4. Executive Summary
   - Key takeaways
   - Strategic implications
   - Recommended actions
   - Success stories

CONTEXT:
- Saudi Vision 2030 metrics
- Government KPI standards
- Arabic/English bilingual support`;

export const DASHBOARD_INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    overall_health: { type: "number" },
    health_status: { type: "string", enum: ["excellent", "good", "fair", "needs_attention", "critical"] },
    key_insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          insight: { type: "string" },
          category: { type: "string" },
          impact: { type: "string" },
          action: { type: "string" }
        }
      }
    },
    trends: {
      type: "array",
      items: {
        type: "object",
        properties: {
          metric: { type: "string" },
          direction: { type: "string" },
          change: { type: "string" },
          significance: { type: "string" }
        }
      }
    },
    alerts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          alert: { type: "string" },
          severity: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    },
    executive_summary: { type: "string" }
  },
  required: ["overall_health", "health_status", "key_insights"]
};

export const buildDashboardInsightsPrompt = (metricsData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Generate dashboard insights for:

DASHBOARD: ${metricsData.dashboardName || 'Executive Dashboard'}
PERIOD: ${metricsData.period || 'Current Month'}

KEY METRICS:
${metricsData.metrics?.map(m => `- ${m.name}: ${m.value} (Target: ${m.target})`).join('\n') || 'Not specified'}

TRENDS:
${metricsData.trends?.map(t => `- ${t.metric}: ${t.change}`).join('\n') || 'Not available'}

COMPARISON: ${metricsData.comparison || 'vs Previous Period'}

Provide actionable insights with executive summary.`;
};

export const DASHBOARD_INSIGHTS_PROMPTS = {
  system: DASHBOARD_INSIGHTS_SYSTEM_PROMPT,
  schema: DASHBOARD_INSIGHTS_SCHEMA,
  buildPrompt: buildDashboardInsightsPrompt
};

export default DASHBOARD_INSIGHTS_PROMPTS;
