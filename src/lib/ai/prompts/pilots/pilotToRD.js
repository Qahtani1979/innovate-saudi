/**
 * Pilot to R&D Conversion Prompts
 * @module pilots/pilotToRD
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const PILOT_TO_RD_SYSTEM_PROMPT = getSystemPrompt('rd_projects');

export const buildPilotToRDPrompt = (pilot) => `You are a research methodology expert. Generate an R&D project proposal from this completed pilot:

Pilot Title: ${pilot.title_en}
Sector: ${pilot.sector}
Results: ${JSON.stringify(pilot.kpis || [])}
Lessons Learned: ${JSON.stringify(pilot.lessons_learned || [])}
Recommendation: ${pilot.recommendation}
Issues: ${JSON.stringify(pilot.risks || [])}

Generate:
1. Research abstract (EN + AR) - what research questions emerged from pilot
2. Research methodology (EN + AR) - how to investigate further
3. Expected outputs (publications, patents, datasets)
4. Research themes and keywords

Focus on advancing TRL from ${pilot.trl_current || 6} to 8-9.`;

export const PILOT_TO_RD_SCHEMA = {
  type: 'object',
  properties: {
    abstract_en: { type: 'string' },
    abstract_ar: { type: 'string' },
    research_area_ar: { type: 'string' },
    methodology_en: { type: 'string' },
    methodology_ar: { type: 'string' },
    expected_outputs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          output_en: { type: 'string' },
          output_ar: { type: 'string' },
          type: { type: 'string' }
        }
      }
    },
    research_themes: { type: 'array', items: { type: 'string' } }
  }
};

export const PILOT_TO_RD_PROMPTS = {
  systemPrompt: PILOT_TO_RD_SYSTEM_PROMPT,
  buildPrompt: buildPilotToRDPrompt,
  schema: PILOT_TO_RD_SCHEMA
};

export default PILOT_TO_RD_PROMPTS;
