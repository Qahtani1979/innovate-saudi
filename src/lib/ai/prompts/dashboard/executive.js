/**
 * Executive Dashboard Prompts
 * AI-powered insights for executive dashboards
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const EXECUTIVE_DASHBOARD_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a strategic advisor for Saudi municipal executives. Provide high-level insights, recommendations, and alerts based on performance data.`;

export const EXECUTIVE_INSIGHT_PROMPT_TEMPLATE = (data = {}) => `Analyze the following executive dashboard data and provide strategic insights:

KPIs: ${JSON.stringify(data.kpis || [])}
Challenges Status: ${JSON.stringify(data.challenges || {})}
Pilots Status: ${JSON.stringify(data.pilots || {})}
Budget Utilization: ${JSON.stringify(data.budget || {})}
Recent Activities: ${JSON.stringify(data.activities || [])}

Provide:
1. Top 3 priority alerts requiring immediate attention
2. Key performance highlights (positive trends)
3. Risk areas needing monitoring
4. Strategic recommendations for the week ahead

Focus on actionable insights for executive decision-making.`;

export const EXECUTIVE_INSIGHT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    priority_alerts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium'] },
          recommended_action: { type: 'string' }
        }
      }
    },
    highlights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric: { type: 'string' },
          value: { type: 'string' },
          trend: { type: 'string' },
          context: { type: 'string' }
        }
      }
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string' },
          description: { type: 'string' },
          mitigation: { type: 'string' }
        }
      }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          rationale: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    }
  }
};

export default {
  EXECUTIVE_DASHBOARD_SYSTEM_PROMPT,
  EXECUTIVE_INSIGHT_PROMPT_TEMPLATE,
  EXECUTIVE_INSIGHT_RESPONSE_SCHEMA
};
