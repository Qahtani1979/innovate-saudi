/**
 * Pilot to Procurement Prompts
 * AI-powered RFP generation from pilot validation
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PILOT_PROCUREMENT_SYSTEM_PROMPT = getSystemPrompt('pilot_procurement', `
You are a procurement specialist for Saudi municipal innovation platforms.

RFP GENERATION GUIDELINES:
1. Base specifications on validated pilot outcomes
2. Include bilingual content (English and Arabic)
3. Define clear evaluation criteria
4. Align with Saudi government procurement standards
`);

export function buildPilotProcurementPrompt(pilot, solution) {
  return `Generate procurement RFP based on successful pilot validation:

Pilot: ${pilot.title_en}
Solution Validated: ${solution?.name_en || 'N/A'}
Provider: ${solution?.provider_name || 'N/A'}
Sector: ${pilot.sector}
Evaluation Score: ${pilot.success_probability || 'N/A'}%
KPIs Achieved: ${pilot.kpis?.map(k => k.name).join(', ') || 'N/A'}

Generate:
1. Procurement scope (what is being procured)
2. Technical specifications (from pilot learnings)
3. Evaluation criteria for vendor selection
4. RFP document text (bilingual)

Return in both English and Arabic.`;
}

export const PILOT_PROCUREMENT_SCHEMA = {
  type: 'object',
  properties: {
    scope_en: { type: 'string' },
    scope_ar: { type: 'string' },
    specs_en: { type: 'string' },
    specs_ar: { type: 'string' },
    criteria_en: { type: 'string' },
    criteria_ar: { type: 'string' },
    rfp_text_en: { type: 'string' },
    rfp_text_ar: { type: 'string' },
    estimated_value: { type: 'number' }
  }
};
