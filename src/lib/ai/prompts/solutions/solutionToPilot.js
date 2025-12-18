/**
 * Solution to pilot workflow prompts
 * @module solutions/solutionToPilot
 */

export const SOLUTION_TO_PILOT_SYSTEM_PROMPT = `You are an expert in designing pilot projects to test solutions for Saudi municipal challenges. Create comprehensive pilot designs.`;

export const createSolutionToPilotPrompt = (solution, challenge) => `Design a pilot to test this solution for a challenge.

SOLUTION:
Name: ${solution.name_en}
Description: ${solution.description_en}
Technology Type: ${solution.technology_type || 'N/A'}
Maturity Level: ${solution.maturity_level || 'N/A'}

CHALLENGE:
Title: ${challenge?.title_en || 'N/A'}
Description: ${challenge?.description_en || 'N/A'}
Sector: ${challenge?.sector || 'N/A'}
Priority: ${challenge?.priority || 'N/A'}

Design pilot with (BILINGUAL):
1. Pilot Objectives
2. Scope and Scale
3. Success Criteria
4. KPIs and Metrics
5. Timeline and Phases
6. Resource Requirements
7. Risk Mitigation Plan`;

export const SOLUTION_TO_PILOT_SCHEMA = {
  type: 'object',
  properties: {
    pilot_title_en: { type: 'string' },
    pilot_title_ar: { type: 'string' },
    objectives_en: { type: 'array', items: { type: 'string' } },
    objectives_ar: { type: 'array', items: { type: 'string' } },
    scope_en: { type: 'string' },
    scope_ar: { type: 'string' },
    success_criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion_en: { type: 'string' },
          criterion_ar: { type: 'string' },
          target: { type: 'string' }
        }
      }
    },
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kpi_en: { type: 'string' },
          kpi_ar: { type: 'string' },
          baseline: { type: 'string' },
          target: { type: 'string' }
        }
      }
    },
    phases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phase_name_en: { type: 'string' },
          phase_name_ar: { type: 'string' },
          duration_weeks: { type: 'number' },
          activities: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    resources: {
      type: 'object',
      properties: {
        budget_estimate: { type: 'number' },
        team_size: { type: 'number' },
        technology_requirements: { type: 'array', items: { type: 'string' } }
      }
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          mitigation_en: { type: 'string' },
          mitigation_ar: { type: 'string' }
        }
      }
    }
  }
};
