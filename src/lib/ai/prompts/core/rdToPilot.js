/**
 * R&D to Pilot Transition Prompt
 * Used by: RDToPilotTransition.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildRDToPilotPrompt = (project) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are generating a pilot project scope from R&D outcomes for Saudi Arabia's Ministry of Municipalities and Housing innovation ecosystem.

## R&D PROJECT DETAILS
- Title: ${project.title_en}
- Institution: ${project.institution}
- Research Area: ${project.research_area}
- TRL Achieved: ${project.trl_current || project.trl_start}
- Duration: ${project.duration_months} months
- Budget: ${project.budget} SAR

## R&D OUTPUTS
- Publications: ${project.publications?.length || 0}
- Patents: ${project.patents?.length || 0}
- Practical Impact: ${project.impact_assessment?.practical_impact || 'Not specified'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## GENERATE PILOT SCOPE
Create a comprehensive pilot proposal including:
1. Pilot title (Arabic + English)
2. Pilot tagline (Arabic + English)
3. Objective - what will be tested/validated (Arabic + English)
4. Hypothesis - specific testable claim
5. Methodology - how pilot will run
6. Scope - geographic and demographic
7. Duration in weeks (realistic for pilot)
8. Budget estimate in SAR
9. 3-5 measurable KPIs
10. Success criteria with thresholds
11. Target population (size, demographics, location)

Make it practical and focused on real-world validation in Saudi municipalities.`;
};

export const rdToPilotSchema = {
  type: 'object',
  required: ['title_en', 'title_ar', 'objective_en', 'objective_ar'],
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    objective_en: { type: 'string', minLength: 50 },
    objective_ar: { type: 'string', minLength: 50 },
    hypothesis: { type: 'string' },
    methodology_en: { type: 'string' },
    methodology_ar: { type: 'string' },
    scope_en: { type: 'string' },
    scope_ar: { type: 'string' },
    duration_weeks: { type: 'number', minimum: 4, maximum: 52 },
    budget: { type: 'number' },
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          baseline: { type: 'string' },
          target: { type: 'string' },
          unit: { type: 'string' }
        }
      }
    },
    success_criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion_en: { type: 'string' },
          criterion_ar: { type: 'string' },
          threshold: { type: 'string' }
        }
      }
    },
    target_population: {
      type: 'object',
      properties: {
        size: { type: 'number' },
        demographics_en: { type: 'string' },
        demographics_ar: { type: 'string' },
        location_en: { type: 'string' },
        location_ar: { type: 'string' }
      }
    }
  }
};

export const RD_TO_PILOT_SYSTEM_PROMPT = `You are an innovation transition specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You help convert successful R&D projects into practical pilot programs that can be tested in real municipal environments across the Kingdom's 13 regions and 300+ municipalities.`;
