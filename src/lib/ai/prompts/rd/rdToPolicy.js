/**
 * R&D to Policy Conversion Prompts
 * @module rd/rdToPolicy
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RD_TO_POLICY_SYSTEM_PROMPT = getSystemPrompt('policy_recommendations');

export const buildRDToPolicyPrompt = (rdProject) => `You are a policy analyst. Generate an evidence-based policy recommendation from this R&D project:

Research Title: ${rdProject.title_en}
Abstract: ${rdProject.abstract_en}
Research Area: ${rdProject.research_area_en}
Publications: ${JSON.stringify(rdProject.publications || [])}
Impact Assessment: ${JSON.stringify(rdProject.impact_assessment || {})}
TRL: ${rdProject.trl_current}

Generate:
1. Policy title (EN + AR)
2. Policy recommendation text (EN + AR) - actionable policy changes
3. Rationale (EN + AR) - evidence from research findings
4. Implementation steps (EN + AR)
5. Success metrics
6. Affected stakeholders

Be specific and actionable for municipal implementation.`;

export const RD_TO_POLICY_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    recommendation_text_en: { type: 'string' },
    recommendation_text_ar: { type: 'string' },
    rationale_en: { type: 'string' },
    rationale_ar: { type: 'string' },
    implementation_steps_en: { type: 'string' },
    implementation_steps_ar: { type: 'string' },
    success_metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric_en: { type: 'string' },
          metric_ar: { type: 'string' },
          target: { type: 'string' }
        }
      }
    },
    affected_stakeholders: { type: 'array', items: { type: 'string' } }
  }
};

export const RD_TO_POLICY_PROMPTS = {
  systemPrompt: RD_TO_POLICY_SYSTEM_PROMPT,
  buildPrompt: buildRDToPolicyPrompt,
  schema: RD_TO_POLICY_SCHEMA
};

export default RD_TO_POLICY_PROMPTS;
