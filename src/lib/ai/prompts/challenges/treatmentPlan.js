/**
 * Treatment Plan Co-Pilot AI Prompt
 * Generates treatment plans based on similar challenges
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Generates prompt for treatment plan
 * @param {Object} challenge - Challenge data
 * @returns {string} Formatted prompt
 */
export function getTreatmentPlanPrompt(challenge) {
  return `${SAUDI_CONTEXT.MUNICIPAL}

Generate a comprehensive treatment plan for this municipal challenge.

CHALLENGE DETAILS:
- Title: ${challenge.title_en}
- Sector: ${challenge.sector}
- Root Cause: ${challenge.root_cause_en || 'Not specified'}
- Priority: ${challenge.priority || 'Not set'}

Based on similar Saudi municipal challenges, provide:

1. RECOMMENDED APPROACH: Best path forward
   - Pilot: For testing new solutions at small scale
   - R&D: For research-intensive problems needing innovation
   - Program: For proven solutions ready to scale
   - Procurement: For off-the-shelf solutions available in market

2. TREATMENT MILESTONES: 5-7 sequential steps with:
   - Clear milestone names
   - Duration estimates
   - Key deliverables

3. RESOURCE ESTIMATES:
   - Timeline in weeks
   - Team size recommendation
   - Budget range estimate

4. SUCCESS FACTORS: Key elements for successful resolution

5. RISKS & MITIGATION: Potential obstacles and how to address them

Consider Saudi municipal governance:
- Committee approval processes
- Budget cycles and procurement rules
- Stakeholder coordination requirements`;
}

/**
 * JSON schema for treatment plan response
 */
export const treatmentPlanSchema = {
  type: 'object',
  properties: {
    recommended_approach: { 
      type: 'string',
      description: 'Primary approach recommendation'
    },
    milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          duration: { type: 'string' },
          deliverables: { 
            type: 'array', 
            items: { type: 'string' } 
          }
        },
        required: ['name', 'duration']
      },
      description: 'Step-by-step milestones'
    },
    timeline_weeks: { 
      type: 'number',
      description: 'Total timeline in weeks'
    },
    team_size: { 
      type: 'string',
      description: 'Recommended team size'
    },
    budget_estimate: { 
      type: 'string',
      description: 'Budget range estimate'
    },
    success_factors: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Key success factors'
    },
    risks: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Risks and mitigation strategies'
    }
  },
  required: ['recommended_approach', 'milestones', 'timeline_weeks', 'success_factors']
};

export default { getTreatmentPlanPrompt, treatmentPlanSchema };
