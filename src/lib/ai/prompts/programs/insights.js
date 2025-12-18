/**
 * Programs Insights Prompts
 * AI-powered program analysis and recommendations
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const PROGRAMS_INSIGHTS_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a program effectiveness analyst for Saudi municipal innovation programs. Analyze program performance, identify patterns, and recommend optimization strategies.`;

export const PROGRAMS_INSIGHTS_PROMPT_TEMPLATE = (data = {}) => `Analyze these innovation programs for Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Programs: ${JSON.stringify(data.programSummary || [])}

Statistics:
- Total: ${data.stats?.total || 0}
- Active: ${data.stats?.active || 0}
- Completed: ${data.stats?.completed || 0}
- Total Participants: ${data.stats?.participants || 0}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Program effectiveness patterns across different types
2. Participant engagement optimization strategies
3. Outcome improvement recommendations
4. Recommendations for new program types or focus areas
5. Partnership and collaboration opportunities`;

export const PROGRAMS_INSIGHTS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    effectiveness_patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    engagement_optimization: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    outcome_improvements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    new_program_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
    partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
  }
};

export default {
  PROGRAMS_INSIGHTS_SYSTEM_PROMPT,
  PROGRAMS_INSIGHTS_PROMPT_TEMPLATE,
  PROGRAMS_INSIGHTS_RESPONSE_SCHEMA
};
