/**
 * Matchmaker Executive Review Prompts
 * Centralized prompts for executive review gate
 * @module matchmaker/executiveReview
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for executive review
 */
export const EXECUTIVE_REVIEW_SYSTEM_PROMPT = getSystemPrompt('matchmaker_executive_review');

/**
 * Build prompt for generating executive brief
 * @param {Object} application - Application data
 * @returns {string} Formatted prompt
 */
export const buildExecutiveBriefPrompt = (application) => `Generate a concise executive briefing for this Matchmaker application in BOTH Arabic and English.

APPLICATION:
- Provider: ${application.provider_name || 'Unknown'}
- Challenge: ${application.challenge_title || 'Unspecified'}
- Proposed Solution: ${application.proposed_solution || 'N/A'}
- Budget: ${application.budget_estimate ? `SAR ${application.budget_estimate.toLocaleString()}` : 'TBD'}
- Timeline: ${application.timeline || 'Not specified'}
- Team Size: ${application.team_size || 'Not specified'}
- Status: ${application.status}

Provide:
1. One-paragraph brief in Arabic for leadership (الملخص التنفيذي)
2. One-paragraph brief in English
3. Key metrics (3-4 bullet points)
4. Recommendation (approve/approve_with_conditions/defer/reject)
5. Risk assessment (low/medium/high)

Format for ministerial-level decision making.`;

/**
 * JSON schema for executive brief
 */
export const EXECUTIVE_BRIEF_SCHEMA = {
  type: 'object',
  properties: {
    brief_ar: { type: 'string', description: 'Arabic executive brief' },
    brief_en: { type: 'string', description: 'English executive brief' },
    key_metrics: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Key decision-making metrics'
    },
    recommendation: { 
      type: 'string',
      enum: ['approve', 'approve_with_conditions', 'defer', 'reject']
    },
    conditions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Conditions if applicable'
    },
    risk_level: {
      type: 'string',
      enum: ['low', 'medium', 'high']
    },
    risk_factors: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['brief_ar', 'brief_en', 'key_metrics', 'recommendation', 'risk_level']
};

/**
 * Build prompt for batch executive review
 * @param {Array} applications - List of applications
 * @returns {string} Formatted prompt
 */
export const buildBatchReviewPrompt = (applications) => `Provide executive summary for ${applications.length} Matchmaker applications:

${applications.map((app, i) => `
${i + 1}. ${app.provider_name || 'Provider'} → ${app.challenge_title || 'Challenge'}
   Budget: SAR ${app.budget_estimate?.toLocaleString() || 'TBD'}
   Status: ${app.status}
`).join('')}

Generate:
1. Overview summary in Arabic and English
2. Priority ranking (which to review first)
3. Common patterns observed
4. Portfolio-level recommendations`;

/**
 * JSON schema for batch review
 */
export const BATCH_REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    overview_ar: { type: 'string' },
    overview_en: { type: 'string' },
    priority_ranking: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          application_id: { type: 'string' },
          priority: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    },
    patterns: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } }
  }
};

/**
 * Executive review prompts namespace
 */
export const EXECUTIVE_REVIEW_PROMPTS = {
  systemPrompt: EXECUTIVE_REVIEW_SYSTEM_PROMPT,
  buildBriefPrompt: buildExecutiveBriefPrompt,
  briefSchema: EXECUTIVE_BRIEF_SCHEMA,
  buildBatchPrompt: buildBatchReviewPrompt,
  batchSchema: BATCH_REVIEW_SCHEMA
};

export default EXECUTIVE_REVIEW_PROMPTS;
