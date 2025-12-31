/**
 * Gap Analysis Engine Prompt Module
 * Comprehensive gap analysis for innovation ecosystem
 * @module prompts/gaps/analysisEngine
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

/**
 * Schema for gap analysis response
 */
export const GAP_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    underserved_sectors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sector_en: { type: 'string' },
          sector_ar: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          gap_description_en: { type: 'string' },
          gap_description_ar: { type: 'string' },
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' }
        },
        required: ['sector_en', 'severity', 'gap_description_en', 'recommendation_en']
      }
    },
    innovation_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gap_type_en: { type: 'string' },
          gap_type_ar: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          action_en: { type: 'string' },
          action_ar: { type: 'string' }
        },
        required: ['gap_type_en', 'severity', 'description_en', 'action_en']
      }
    },
    geographic_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          region_en: { type: 'string' },
          region_ar: { type: 'string' },
          gap_description_en: { type: 'string' },
          gap_description_ar: { type: 'string' },
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' }
        },
        required: ['region_en', 'gap_description_en', 'recommendation_en']
      }
    },
    technology_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          technology_en: { type: 'string' },
          technology_ar: { type: 'string' },
          potential_impact_en: { type: 'string' },
          potential_impact_ar: { type: 'string' }
        },
        required: ['technology_en', 'potential_impact_en']
      }
    },
    priority_actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action_en: { type: 'string' },
          action_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          expected_impact_en: { type: 'string' },
          expected_impact_ar: { type: 'string' }
        },
        required: ['action_en', 'priority', 'expected_impact_en']
      }
    }
  },
  required: ['underserved_sectors', 'innovation_gaps', 'priority_actions']
};

/**
 * Gap analysis prompt template
 * @param {Object} context - Analysis context
 * @returns {string} Formatted prompt
 */
export function GAP_ANALYSIS_PROMPT_TEMPLATE(context) {
  const { sectorData, challenges, pilots, solutions, rdProjects } = context;
  
  return `Perform COMPREHENSIVE gap analysis for Saudi municipal innovation ecosystem:

${SAUDI_CONTEXT.FULL}

CURRENT PORTFOLIO:
${JSON.stringify(sectorData, null, 2)}

DETAILED METRICS:
- Total Challenges: ${challenges.total} (Approved: ${challenges.approved}, High Priority: ${challenges.highPriority})
- Total Pilots: ${pilots.total} (Active: ${pilots.active}, At Risk: ${pilots.atRisk})
- Total Solutions: ${solutions.total} (Market-ready: ${solutions.marketReady})
- Total R&D Projects: ${rdProjects.total}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Identify in BOTH English and Arabic:

1. **Underserved Sectors** (high challenges but low solutions/pilots)
2. **Innovation Gaps** (missing capabilities, solution types, or approaches)
3. **Geographic Gaps** (municipalities/regions with limited activity)
4. **Technology Gaps** (emerging tech not yet piloted: AI, IoT, blockchain, digital twins, etc.)
5. **Capacity Gaps** (missing expertise, infrastructure, labs, sandboxes)
6. **Skills & Talent Gaps** (expertise areas needed but missing)
7. **Partnership Gaps** (underutilized collaborations: academia, private sector, international)
8. **Budget Gaps** (underfunded critical sectors vs overfunded low-priority)
9. **Timeline Gaps** (initiatives with no near-term execution plans)
10. **Service Quality Gaps** (municipal services with low performance/satisfaction)

For EACH gap provide:
- Severity (high/medium/low)
- Specific actionable recommendations
- Quick wins vs long-term strategies
- Resource/budget estimates

Include USE CASE scenarios:
- "Plan next R&D call based on these gaps"
- "Identify urgent intervention areas for next quarter"
- "Compare gap evolution: are we improving?"`;
}

/**
 * Gap analysis system prompt
 */
export const GAP_ANALYSIS_SYSTEM_PROMPT = `You are an expert innovation ecosystem analyst specializing in Saudi Arabia's municipal innovation landscape.

Your role is to identify strategic gaps and opportunities in the innovation portfolio, considering:
- Vision 2030 alignment and national priorities
- Regional development balance across Saudi regions
- Technology readiness and adoption patterns
- Stakeholder capacity and resource constraints
- International best practices and benchmarks

Provide bilingual (English/Arabic) analysis with actionable insights.`;

export default {
  GAP_ANALYSIS_PROMPT_TEMPLATE,
  GAP_ANALYSIS_SCHEMA,
  GAP_ANALYSIS_SYSTEM_PROMPT
};
