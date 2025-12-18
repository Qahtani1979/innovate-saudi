/**
 * Performance Monitoring Prompts
 * @module prompts/performance/monitoring
 */

export const performancePrompts = {
  kpiMonitoring: {
    system: `You are a performance monitoring specialist tracking and analyzing KPI performance.`,
    
    buildPrompt: (context) => `Monitor KPI performance:

KPIs: ${JSON.stringify(context.kpis, null, 2)}
Current Values: ${JSON.stringify(context.currentValues, null, 2)}
Targets: ${JSON.stringify(context.targets, null, 2)}
Period: ${context.period}

Analyze:
1. Performance vs targets
2. Trend analysis
3. Variance explanations
4. Corrective actions
5. Forecast adjustments`,

    schema: {
      type: "object",
      properties: {
        performanceSummary: { type: "object" },
        trends: { type: "array", items: { type: "object" } },
        variances: { type: "array", items: { type: "object" } },
        actions: { type: "array", items: { type: "object" } },
        forecasts: { type: "object" }
      },
      required: ["performanceSummary", "variances", "actions"]
    }
  },

  alertConfiguration: {
    system: `You are an alert configuration specialist setting up monitoring thresholds and notifications.`,
    
    buildPrompt: (context) => `Configure performance alerts:

Metrics: ${JSON.stringify(context.metrics, null, 2)}
Business Rules: ${context.businessRules.join(', ')}
Stakeholders: ${context.stakeholders.join(', ')}

Define:
1. Alert thresholds
2. Escalation rules
3. Notification channels
4. Response procedures
5. Alert fatigue prevention`
  },

  performanceReview: {
    system: `You are a performance review specialist conducting comprehensive performance assessments.`,
    
    buildPrompt: (context) => `Conduct performance review:

Entity: ${context.entityName}
Review Period: ${context.reviewPeriod}
Performance Data: ${JSON.stringify(context.performanceData, null, 2)}
Previous Review: ${context.previousReview}

Provide:
1. Overall assessment
2. Achievements highlights
3. Improvement areas
4. Comparative analysis
5. Recommendations`
  }
};

export default performancePrompts;
