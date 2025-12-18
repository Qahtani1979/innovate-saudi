/**
 * Scaling Readiness Prompts
 * Centralized prompts for pilot scaling readiness assessment
 * @module scaling/readiness
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for scaling readiness
 */
export const SCALING_READINESS_SYSTEM_PROMPT = getSystemPrompt('scaling_readiness_assessment');

/**
 * Build prompt for scaling readiness analysis
 * @param {Object} pilot - Pilot data
 * @param {Object} scores - Component scores
 * @returns {string} Formatted prompt
 */
export const buildScalingReadinessPrompt = (pilot, scores) => `Analyze this pilot's scaling readiness and provide specific improvement actions:

Pilot: ${pilot.title_en}
Overall Readiness: ${scores.total}%
- KPI Achievement: ${scores.kpi}%
- Cost Model Clarity: ${scores.cost}%
- Stakeholder Alignment: ${scores.stakeholder}%
- Documentation: ${scores.documentation}%
- Risk Mitigation: ${scores.risk}%

For each dimension below 80%, provide 2-3 specific actionable steps to improve.`;

/**
 * JSON schema for scaling readiness
 */
export const SCALING_READINESS_SCHEMA = {
  type: 'object',
  properties: {
    kpi_actions: { type: 'array', items: { type: 'string' } },
    cost_actions: { type: 'array', items: { type: 'string' } },
    stakeholder_actions: { type: 'array', items: { type: 'string' } },
    documentation_actions: { type: 'array', items: { type: 'string' } },
    risk_actions: { type: 'array', items: { type: 'string' } },
    overall_recommendation: { type: 'string' }
  }
};

/**
 * Build prompt for scaling strategy
 * @param {Object} pilot - Pilot data
 * @param {number} readinessScore - Overall readiness score
 * @returns {string} Formatted prompt
 */
export const buildScalingStrategyPrompt = (pilot, readinessScore) => `Develop a scaling strategy for this pilot:

Pilot: ${pilot.title_en}
Sector: ${pilot.sector || 'N/A'}
Status: ${pilot.stage || pilot.status}
Readiness Score: ${readinessScore}%
Budget: SAR ${pilot.budget?.toLocaleString() || 'TBD'}
Municipality: ${pilot.municipality_name || 'N/A'}

Generate:
1. Recommended scaling approach (horizontal/vertical/hybrid)
2. Priority municipalities for expansion
3. Resource requirements
4. Risk mitigation plan
5. Timeline (months)
6. Success metrics for scaled version`;

/**
 * JSON schema for scaling strategy
 */
export const SCALING_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    scaling_approach: { 
      type: 'string',
      enum: ['horizontal', 'vertical', 'hybrid', 'franchise', 'phased']
    },
    priority_municipalities: {
      type: 'array',
      items: { type: 'string' }
    },
    resource_requirements: {
      type: 'object',
      properties: {
        budget_increase: { type: 'string' },
        team_size: { type: 'number' },
        infrastructure: { type: 'array', items: { type: 'string' } }
      }
    },
    risk_mitigation: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk: { type: 'string' },
          mitigation: { type: 'string' }
        }
      }
    },
    timeline_months: { type: 'number' },
    success_metrics: { type: 'array', items: { type: 'string' } }
  }
};

/**
 * Scaling readiness prompts namespace
 */
export const SCALING_READINESS_PROMPTS = {
  systemPrompt: SCALING_READINESS_SYSTEM_PROMPT,
  buildReadinessPrompt: buildScalingReadinessPrompt,
  readinessSchema: SCALING_READINESS_SCHEMA,
  buildStrategyPrompt: buildScalingStrategyPrompt,
  strategySchema: SCALING_STRATEGY_SCHEMA
};

export default SCALING_READINESS_PROMPTS;
