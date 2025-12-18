/**
 * KPI Generation Prompts
 * @module strategy/kpis
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const KPI_SYSTEM_PROMPT = getSystemPrompt('kpi_generation', `
You are a performance measurement specialist for Saudi municipal innovation.
Your role is to create SMART KPIs aligned with Vision 2030 and municipal governance standards.
Focus on measurable, actionable indicators with clear targets.
`);

/**
 * Build KPI generation prompt
 * @param {Object} params - Objectives and context
 * @returns {string} Formatted prompt
 */
export function buildKpiPrompt({ objectives, sector, strategicPriorities }) {
  return `Generate strategic KPIs in BOTH English and Arabic:

Objectives:
${objectives?.map((o, i) => `${i + 1}. ${o.title_en}`).join('\n') || 'Not specified'}

Sector: ${sector || 'Municipal services'}
Strategic Priorities: ${strategicPriorities?.join(', ') || 'Vision 2030 alignment'}

For each objective create KPIs with:
1. KPI name (bilingual)
2. Description and rationale
3. Measurement unit
4. Baseline value
5. Target value
6. Target date
7. Data source
8. Measurement frequency
9. Owner responsible
10. Alignment with Vision 2030`;
}

export const KPI_SCHEMA = {
  type: "object",
  properties: {
    kpis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          objective_id: { type: "string" },
          name_en: { type: "string" },
          name_ar: { type: "string" },
          description: { type: "string" },
          unit: { type: "string" },
          baseline: { type: "number" },
          target: { type: "number" },
          target_date: { type: "string" },
          data_source: { type: "string" },
          frequency: { type: "string" },
          owner: { type: "string" },
          vision_2030_alignment: { type: "string" }
        }
      }
    },
    measurement_framework: { type: "string" }
  }
};

export const KPI_PROMPTS = {
  systemPrompt: KPI_SYSTEM_PROMPT,
  buildPrompt: buildKpiPrompt,
  schema: KPI_SCHEMA
};
