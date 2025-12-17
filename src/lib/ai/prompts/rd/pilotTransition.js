/**
 * R&D to Pilot Transition Prompts
 * For generating pilot designs from validated R&D projects
 */

import { getSystemPrompt } from '@/lib/saudiContext';
import { buildBilingualSchema } from '../../bilingualSchemaBuilder';

export const PILOT_TRANSITION_PROMPTS = {
  systemPrompt: getSystemPrompt('rd_pilot_transition'),
  
  buildPrompt: (rdProject, municipality = null) => `You are a pilot design expert. Generate a pilot test plan from this validated R&D project:

R&D PROJECT:
Title: ${rdProject.title_en}
Title (AR): ${rdProject.title_ar || 'N/A'}
Abstract: ${rdProject.abstract_en}
Current TRL: ${rdProject.trl_current || 'Unknown'}
Target TRL: 8 (System complete and qualified)
Research Area: ${rdProject.research_area_en || 'General'}
Methodology: ${rdProject.methodology_en || 'Not specified'}

EXPECTED OUTPUTS FROM R&D:
${JSON.stringify(rdProject.expected_outputs || [], null, 2)}

${municipality ? `TARGET MUNICIPALITY: ${municipality.name_en} (${municipality.name_ar})
Population: ${municipality.population}
Region: ${municipality.region}` : ''}

Generate a comprehensive pilot to test this research in a real municipal environment:

1. PILOT TITLE (EN + AR)
   - Clear and action-oriented
   - Indicates what will be tested

2. DESCRIPTION (EN + AR)
   - What technology/approach will be tested
   - Scope of the pilot

3. OBJECTIVE (EN + AR)
   - What we aim to validate
   - Specific outcomes to measure

4. HYPOTHESIS
   - What we expect to prove
   - Measurable prediction

5. TEST METHODOLOGY
   - How the pilot will be conducted
   - Data collection approach

6. SUCCESS CRITERIA (KPIs)
   - Specific, measurable indicators
   - Targets for each KPI

Focus on:
- Validating research findings in practice
- Advancing TRL from current level to 8
- Demonstrating value for municipality
- Preparing for potential scaling`,

  schema: buildBilingualSchema({
    type: 'object',
    properties: {
      title_en: { type: 'string' },
      title_ar: { type: 'string' },
      description_en: { type: 'string' },
      description_ar: { type: 'string' },
      objective_en: { type: 'string' },
      objective_ar: { type: 'string' },
      hypothesis: { type: 'string' },
      methodology: { type: 'string' },
      kpis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            name_ar: { type: 'string' },
            target: { type: 'string' },
            measurement_method: { type: 'string' }
          },
          required: ['name_en', 'target']
        }
      },
      risks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string' },
            mitigation: { type: 'string' }
          }
        }
      },
      recommended_duration_weeks: { type: 'number' }
    },
    required: ['title_en', 'title_ar', 'description_en', 'objective_en', 'hypothesis', 'methodology', 'kpis']
  })
};

export default PILOT_TRANSITION_PROMPTS;
