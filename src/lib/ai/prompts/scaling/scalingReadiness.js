/**
 * Scaling Readiness Predictor Prompts
 * For assessing municipal readiness for solution scaling
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SCALING_READINESS_PROMPTS = {
  systemPrompt: getSystemPrompt('scaling_readiness'),
  
  buildPrompt: (municipality, solution) => `Assess municipality readiness for scaling solution:

MUNICIPALITY: ${municipality?.name_en || 'Unknown'}
MUNICIPALITY (AR): ${municipality?.name_ar || 'N/A'}
- MII Score: ${municipality?.mii_score || 'N/A'}
- Population: ${municipality?.population || 'Unknown'}
- Active pilots: ${municipality?.active_pilots || 0}
- Region: ${municipality?.region || 'Unknown'}

SOLUTION TO SCALE: ${solution.name_en}
- Type: ${solution.provider_type || 'Standard'}
- Category: ${solution.category || 'General'}
- Requirements: ${solution.technical_specifications?.integration_requirements || 'Standard integration'}
- Complexity: ${solution.complexity_level || 'Medium'}

ASSESSMENT DIMENSIONS (Score 0-100 each):

1. INFRASTRUCTURE
   - Technical capacity
   - IT systems maturity
   - Connectivity

2. SKILLS & CAPACITY
   - Staff capability
   - Training readiness
   - Change management experience

3. BUDGET
   - Financial readiness
   - Budget availability
   - Funding sustainability

4. GOVERNANCE
   - Political will
   - Process maturity
   - Decision-making speed

5. CITIZEN READINESS
   - Public acceptance
   - Digital literacy
   - Service adoption history

Provide overall readiness score, dimension scores, gaps to address, and recommended enablers.`,

  schema: {
    type: "object",
    properties: {
      overall_score: { 
        type: "number",
        description: "Overall readiness score 0-100"
      },
      dimension_scores: {
        type: "object",
        properties: {
          infrastructure: { type: "number" },
          skills_capacity: { type: "number" },
          budget: { type: "number" },
          governance: { type: "number" },
          citizen_readiness: { type: "number" }
        },
        required: ["infrastructure", "skills_capacity", "budget", "governance", "citizen_readiness"]
      },
      readiness_level: { 
        type: "string",
        description: "Ready / Needs Support / Not Ready"
      },
      gaps: { 
        type: "array", 
        items: { type: "string" },
        description: "Gaps to address before scaling"
      },
      enablers: { 
        type: "array", 
        items: { type: "string" },
        description: "Recommended enablers for success"
      }
    },
    required: ["overall_score", "dimension_scores", "readiness_level", "gaps", "enablers"]
  }
};

export default SCALING_READINESS_PROMPTS;
