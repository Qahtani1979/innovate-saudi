/**
 * Advanced Analytics Prompts
 * AI prompts for data analysis and insights generation
 * @module prompts/analytics/advancedAnalytics
 */

export const DATA_INSIGHTS_PROMPT = {
  id: 'data_insights',
  version: '1.0.0',
  category: 'analytics',
  system: `You are a data analytics expert specializing in municipal and government data analysis.
Extract meaningful insights from complex datasets and identify patterns.
Consider Saudi Arabian context and Vision 2030 performance indicators.
Present findings in clear, actionable format for decision-makers.`,
  template: `Analyze this dataset for insights:

Data Type: {{dataType}}
Time Period: {{timePeriod}}
Key Metrics: {{metrics}}
Data Points: {{dataPoints}}
Comparison Baseline: {{baseline}}
Business Context: {{context}}

Provide:
1. Key trends and patterns
2. Anomalies and outliers
3. Correlations
4. Predictive insights
5. Actionable recommendations`,
  schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      keyTrends: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            trend: { type: 'string' },
            direction: { type: 'string', enum: ['increasing', 'decreasing', 'stable', 'volatile'] },
            magnitude: { type: 'string' },
            significance: { type: 'string', enum: ['high', 'medium', 'low'] },
            implication: { type: 'string' }
          }
        }
      },
      anomalies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            value: { type: 'string' },
            expected: { type: 'string' },
            deviation: { type: 'string' },
            possibleCause: { type: 'string' }
          }
        }
      },
      correlations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            variables: { type: 'array', items: { type: 'string' } },
            strength: { type: 'string', enum: ['strong', 'moderate', 'weak'] },
            direction: { type: 'string', enum: ['positive', 'negative'] },
            insight: { type: 'string' }
          }
        }
      },
      predictions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            forecast: { type: 'string' },
            confidence: { type: 'string' },
            assumptions: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            finding: { type: 'string' },
            action: { type: 'string' },
            priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            expectedImpact: { type: 'string' }
          }
        }
      }
    },
    required: ['summary', 'keyTrends', 'recommendations']
  }
};

export const PERFORMANCE_ANALYTICS_PROMPT = {
  id: 'performance_analytics',
  version: '1.0.0',
  category: 'analytics',
  system: `You are a performance analytics specialist.
Analyze organizational and program performance against targets and benchmarks.
Provide insights aligned with Saudi Vision 2030 KPIs and international best practices.`,
  template: `Analyze performance data:

Entity: {{entityName}}
KPIs: {{kpis}}
Targets: {{targets}}
Actual Results: {{actuals}}
Benchmark Data: {{benchmarks}}
Time Period: {{period}}

Generate performance insights with improvement recommendations.`,
  schema: {
    type: 'object',
    properties: {
      overallPerformance: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          rating: { type: 'string', enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'critical'] },
          trend: { type: 'string' }
        }
      },
      kpiAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kpi: { type: 'string' },
            target: { type: 'string' },
            actual: { type: 'string' },
            variance: { type: 'string' },
            status: { type: 'string', enum: ['on_track', 'at_risk', 'off_track'] },
            rootCause: { type: 'string' }
          }
        }
      },
      benchmarkComparison: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            entityValue: { type: 'string' },
            benchmarkValue: { type: 'string' },
            gap: { type: 'string' },
            improvement: { type: 'string' }
          }
        }
      },
      actionPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            currentState: { type: 'string' },
            targetState: { type: 'string' },
            actions: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' }
          }
        }
      }
    },
    required: ['overallPerformance', 'kpiAnalysis', 'actionPlan']
  }
};

export const PREDICTIVE_ANALYTICS_PROMPT = {
  id: 'predictive_analytics',
  version: '1.0.0',
  category: 'analytics',
  system: `You are a predictive analytics expert.
Use historical data to forecast future trends and outcomes.
Consider Saudi economic indicators and Vision 2030 trajectory.`,
  template: `Generate predictions based on:

Historical Data: {{historicalData}}
Variables: {{variables}}
External Factors: {{externalFactors}}
Forecast Horizon: {{horizon}}
Confidence Required: {{confidenceLevel}}

Provide forecasts with scenario analysis.`,
  schema: {
    type: 'object',
    properties: {
      baseForecast: {
        type: 'object',
        properties: {
          metric: { type: 'string' },
          value: { type: 'string' },
          confidence: { type: 'number' },
          methodology: { type: 'string' }
        }
      },
      scenarios: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', enum: ['optimistic', 'base', 'pessimistic'] },
            assumptions: { type: 'array', items: { type: 'string' } },
            forecast: { type: 'string' },
            probability: { type: 'number' }
          }
        }
      },
      riskFactors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            factor: { type: 'string' },
            impact: { type: 'string' },
            likelihood: { type: 'string' },
            mitigation: { type: 'string' }
          }
        }
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['baseForecast', 'scenarios', 'riskFactors']
  }
};

export default {
  DATA_INSIGHTS_PROMPT,
  PERFORMANCE_ANALYTICS_PROMPT,
  PREDICTIVE_ANALYTICS_PROMPT
};
