/**
 * Portfolio Report AI Prompts
 * AI-powered report generation and analysis
 * @module prompts/portfolio/reportAI
 * @version 1.0.0
 */

/**
 * System prompt for report generation AI
 */
export const REPORT_GENERATION_SYSTEM_PROMPT = `You are an expert report generation AI for a municipal innovation platform.
Your role is to analyze data and generate insightful, actionable reports.

Guidelines:
- Focus on actionable insights, not just data summaries
- Highlight trends, anomalies, and opportunities
- Use clear, professional language appropriate for government stakeholders
- Provide both English and Arabic content when requested
- Include specific recommendations with expected impact
- Prioritize findings by importance and urgency`;

/**
 * Build prompt for generating custom report content
 */
export function buildCustomReportPrompt(reportConfig, data, language = 'en') {
  return `Generate a comprehensive report based on the following configuration and data.

Report Type: ${reportConfig.report_type}
Report Name: ${reportConfig.name_en}
Time Period: ${reportConfig.time_period || 'Last 30 days'}

Data Summary:
${JSON.stringify(data, null, 2)}

Requirements:
1. Executive Summary (2-3 sentences)
2. Key Findings (top 5 insights)
3. Trend Analysis (identify patterns)
4. Recommendations (3-5 actionable items)
5. Risk Alerts (any concerns)

Language: ${language === 'ar' ? 'Arabic' : 'English'}

Provide structured, data-driven insights that help decision-makers take action.`;
}

/**
 * Schema for custom report AI response
 */
export const CUSTOM_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    key_findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          finding: { type: 'string' },
          finding_ar: { type: 'string' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string' }
        }
      }
    },
    trends: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trend: { type: 'string' },
          trend_ar: { type: 'string' },
          direction: { type: 'string', enum: ['up', 'down', 'stable'] },
          significance: { type: 'number' }
        }
      }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          recommendation_ar: { type: 'string' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          expected_impact: { type: 'string' }
        }
      }
    },
    risk_alerts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          alert: { type: 'string' },
          alert_ar: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'warning', 'info'] }
        }
      }
    }
  },
  required: ['executive_summary', 'key_findings', 'recommendations']
};

/**
 * Build prompt for predictive analytics on portfolio data
 */
export function buildPortfolioPredictivePrompt(portfolioData) {
  return `Analyze this portfolio data and provide predictive insights.

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

Provide:
1. Performance predictions for next quarter
2. Risk factors that may impact success
3. Resource allocation recommendations
4. Early warning signals
5. Optimization opportunities

Focus on actionable predictions that help portfolio managers make better decisions.`;
}

/**
 * Schema for predictive analytics response
 */
export const PREDICTIVE_ANALYTICS_SCHEMA = {
  type: 'object',
  properties: {
    performance_predictions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric: { type: 'string' },
          current_value: { type: 'number' },
          predicted_value: { type: 'number' },
          confidence: { type: 'number' },
          timeframe: { type: 'string' }
        }
      }
    },
    risk_factors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          factor: { type: 'string' },
          factor_ar: { type: 'string' },
          probability: { type: 'number' },
          impact: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          mitigation: { type: 'string' }
        }
      }
    },
    resource_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          recommendation_ar: { type: 'string' },
          expected_roi: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    early_warnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          warning: { type: 'string' },
          warning_ar: { type: 'string' },
          urgency: { type: 'string', enum: ['immediate', 'soon', 'monitor'] },
          affected_entities: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    optimization_opportunities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          opportunity: { type: 'string' },
          opportunity_ar: { type: 'string' },
          potential_improvement: { type: 'string' },
          effort_required: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      }
    }
  },
  required: ['performance_predictions', 'risk_factors', 'resource_recommendations']
};

/**
 * Build prompt for anomaly detection in portfolio metrics
 */
export function buildAnomalyDetectionPrompt(metricsData, thresholds) {
  return `Analyze these metrics for anomalies and unusual patterns.

Metrics Data:
${JSON.stringify(metricsData, null, 2)}

Thresholds:
${JSON.stringify(thresholds, null, 2)}

Identify:
1. Statistical anomalies (values outside normal range)
2. Trend anomalies (unexpected changes in direction)
3. Pattern anomalies (unusual sequences or correlations)
4. Temporal anomalies (time-based irregularities)

For each anomaly, provide context and recommended actions.`;
}

/**
 * Schema for anomaly detection response
 */
export const ANOMALY_DETECTION_SCHEMA = {
  type: 'object',
  properties: {
    anomalies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['statistical', 'trend', 'pattern', 'temporal'] },
          metric: { type: 'string' },
          description: { type: 'string' },
          description_ar: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          value: { type: 'number' },
          expected_range: { type: 'object', properties: { min: { type: 'number' }, max: { type: 'number' } } },
          timestamp: { type: 'string' },
          recommended_action: { type: 'string' },
          recommended_action_ar: { type: 'string' }
        }
      }
    },
    summary: {
      type: 'object',
      properties: {
        total_anomalies: { type: 'number' },
        critical_count: { type: 'number' },
        affected_metrics: { type: 'array', items: { type: 'string' } },
        overall_health: { type: 'string', enum: ['healthy', 'attention_needed', 'critical'] }
      }
    }
  },
  required: ['anomalies', 'summary']
};
