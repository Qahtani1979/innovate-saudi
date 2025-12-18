/**
 * Report Generation Prompts
 * AI prompts for automated report creation and analysis
 * @module prompts/reporting/reportGeneration
 */

export const EXECUTIVE_REPORT_PROMPT = {
  id: 'executive_report',
  version: '1.0.0',
  category: 'reporting',
  system: `You are an expert report writer specializing in executive communications for Saudi Arabian government.
Create clear, concise reports that highlight key insights and actionable recommendations.
Use professional language appropriate for senior leadership and align with Vision 2030 objectives.
Support bilingual output (Arabic/English) when requested.`,
  template: `Generate executive report:

Report Type: {{reportType}}
Time Period: {{period}}
Key Data: {{keyData}}
Metrics Summary: {{metrics}}
Audience: {{audience}}
Previous Period Comparison: {{comparison}}

Create comprehensive executive report with:
1. Executive summary
2. Key highlights
3. Performance analysis
4. Recommendations
5. Next steps`,
  schema: {
    type: 'object',
    properties: {
      executiveSummary: { type: 'string' },
      keyHighlights: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            highlight: { type: 'string' },
            impact: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
            significance: { type: 'string' }
          }
        }
      },
      performanceAnalysis: {
        type: 'object',
        properties: {
          overallScore: { type: 'number' },
          trendDirection: { type: 'string', enum: ['improving', 'stable', 'declining'] },
          keyMetrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                metric: { type: 'string' },
                value: { type: 'string' },
                target: { type: 'string' },
                variance: { type: 'string' }
              }
            }
          }
        }
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            priority: { type: 'number' },
            recommendation: { type: 'string' },
            rationale: { type: 'string' },
            expectedOutcome: { type: 'string' },
            timeline: { type: 'string' }
          }
        }
      },
      nextSteps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            owner: { type: 'string' },
            deadline: { type: 'string' }
          }
        }
      }
    },
    required: ['executiveSummary', 'keyHighlights', 'recommendations']
  }
};

export const PROGRESS_REPORT_PROMPT = {
  id: 'progress_report',
  version: '1.0.0',
  category: 'reporting',
  system: `You are a project reporting specialist.
Generate detailed progress reports that accurately reflect project status.
Identify risks and blockers proactively with mitigation strategies.`,
  template: `Generate progress report:

Project/Initiative: {{projectName}}
Reporting Period: {{period}}
Milestones: {{milestones}}
Tasks Completed: {{completed}}
Tasks In Progress: {{inProgress}}
Blockers: {{blockers}}
Budget Status: {{budget}}

Provide comprehensive progress assessment.`,
  schema: {
    type: 'object',
    properties: {
      overallStatus: { type: 'string', enum: ['on_track', 'at_risk', 'delayed', 'completed'] },
      progressPercentage: { type: 'number' },
      summary: { type: 'string' },
      milestoneStatus: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            milestone: { type: 'string' },
            plannedDate: { type: 'string' },
            actualDate: { type: 'string' },
            status: { type: 'string' },
            variance: { type: 'string' }
          }
        }
      },
      accomplishments: { type: 'array', items: { type: 'string' } },
      risksAndIssues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['risk', 'issue'] },
            description: { type: 'string' },
            severity: { type: 'string' },
            mitigation: { type: 'string' }
          }
        }
      },
      budgetAnalysis: {
        type: 'object',
        properties: {
          planned: { type: 'string' },
          actual: { type: 'string' },
          variance: { type: 'string' },
          forecast: { type: 'string' }
        }
      },
      nextPeriodPlan: { type: 'array', items: { type: 'string' } }
    },
    required: ['overallStatus', 'progressPercentage', 'summary', 'milestoneStatus']
  }
};

export const DASHBOARD_REPORT_PROMPT = {
  id: 'dashboard_report',
  version: '1.0.0',
  category: 'reporting',
  system: `You are a data visualization and reporting expert.
Transform complex data into clear, actionable dashboard narratives.
Focus on insights that drive decision-making.`,
  template: `Generate dashboard narrative:

Dashboard Type: {{dashboardType}}
Key Metrics: {{metrics}}
Time Range: {{timeRange}}
Filters Applied: {{filters}}
Anomalies Detected: {{anomalies}}

Create narrative summary for dashboard data.`,
  schema: {
    type: 'object',
    properties: {
      narrativeSummary: { type: 'string' },
      keyInsights: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            insight: { type: 'string' },
            dataPoint: { type: 'string' },
            implication: { type: 'string' }
          }
        }
      },
      trendAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            trend: { type: 'string' },
            projection: { type: 'string' }
          }
        }
      },
      alertsAndWarnings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['alert', 'warning', 'info'] },
            message: { type: 'string' },
            action: { type: 'string' }
          }
        }
      }
    },
    required: ['narrativeSummary', 'keyInsights']
  }
};

export default {
  EXECUTIVE_REPORT_PROMPT,
  PROGRESS_REPORT_PROMPT,
  DASHBOARD_REPORT_PROMPT
};
