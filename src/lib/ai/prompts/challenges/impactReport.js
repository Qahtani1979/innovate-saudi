/**
 * Impact Report Generator Prompts
 * @module challenges/impactReport
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const IMPACT_REPORT_SYSTEM_PROMPT = getSystemPrompt('challenges_impact_report');

export const buildImpactReportPrompt = (challenge, pilots, contracts) => `Generate comprehensive BILINGUAL impact report for resolved municipal challenge:

Challenge: ${challenge.title_en} / ${challenge.title_ar}
Sector: ${challenge.sector}
Municipality: ${challenge.municipality_id}
Resolution Summary: ${challenge.resolution_summary || 'N/A'}
Impact Achieved: ${challenge.impact_achieved || 'N/A'}
Lessons Learned: ${JSON.stringify(challenge.lessons_learned || [])}

Linked Pilots: ${pilots.length} (Stages: ${pilots.map(p => p.stage).join(', ')})
Total Budget Spent: ${pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0)} SAR
Contracts: ${contracts.length} valued at ${contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0)} SAR

Population Affected: ${challenge.affected_population_size || 'Unknown'}

Generate COMPLETE BILINGUAL (EN + AR) impact report with:
1. Executive summary (2-3 paragraphs, EN + AR)
2. Key outcomes achieved (5-7 bullet points, EN + AR)
3. Population benefited (breakdown if data available)
4. Financial ROI analysis (investment vs impact)
5. Success factors (what worked well, EN + AR)
6. Challenges faced (obstacles overcome, EN + AR)
7. Recommendations for replication (3-5 actionable recommendations, EN + AR)
8. Scaling potential (where else this could work)`;

export const IMPACT_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary_en: { type: 'string' },
    executive_summary_ar: { type: 'string' },
    key_outcomes: {
      type: 'array',
      items: {
        type: 'object',
        properties: { en: { type: 'string' }, ar: { type: 'string' } }
      }
    },
    population_impact: {
      type: 'object',
      properties: {
        total_beneficiaries: { type: 'number' },
        direct_beneficiaries: { type: 'number' },
        indirect_beneficiaries: { type: 'number' },
        demographics_reached: { type: 'string' }
      }
    },
    financial_roi: {
      type: 'object',
      properties: {
        total_investment_sar: { type: 'number' },
        cost_per_beneficiary_sar: { type: 'number' },
        estimated_annual_savings_sar: { type: 'number' },
        roi_percentage: { type: 'number' }
      }
    },
    success_factors: {
      type: 'array',
      items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
    },
    challenges_faced: {
      type: 'array',
      items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: { en: { type: 'string' }, ar: { type: 'string' }, priority: { type: 'string' } }
      }
    },
    scaling_potential: {
      type: 'object',
      properties: {
        readiness_score: { type: 'number' },
        target_municipalities: { type: 'number' },
        estimated_national_impact: { type: 'string' }
      }
    }
  }
};

export const IMPACT_REPORT_PROMPTS = {
  systemPrompt: IMPACT_REPORT_SYSTEM_PROMPT,
  buildPrompt: buildImpactReportPrompt,
  schema: IMPACT_REPORT_SCHEMA
};

export default IMPACT_REPORT_PROMPTS;
