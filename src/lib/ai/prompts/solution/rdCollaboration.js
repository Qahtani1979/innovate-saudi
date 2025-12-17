/**
 * R&D Collaboration Proposal Prompt
 * Used by: SolutionRDCollaborationProposal.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildRDCollaborationPrompt = (solution, formData) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are generating a comprehensive R&D collaboration proposal between a research institution and a solution provider.

## SOLUTION DETAILS
- Name: ${solution.name_en}
- Provider: ${solution.provider_name}
- Description: ${solution.description_en}
- Current TRL: ${solution.trl || 'N/A'}
- Maturity Level: ${solution.maturity_level}
- Technical Specs: ${JSON.stringify(solution.technical_specifications || {})}

## RESEARCHER INPUT
- Institution: ${formData.institution_en}
- Research Area: ${formData.research_area_en}
- Proposed Objectives: ${formData.proposed_objectives}
- Target TRL: ${formData.expected_trl_improvement}
- Duration: ${formData.duration_months} months

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## GENERATE R&D PROPOSAL

1. **Abstract** (English and Arabic)
   - Research objectives
   - Proposed methodology
   - Expected contribution

2. **Collaboration Objectives**
   - Specific measurable goals
   - TRL advancement targets
   - Knowledge transfer outcomes

3. **Expected Outputs**
   - Publications
   - Patents/IP
   - Prototype improvements
   - Training/capacity building

4. **Methodology**
   - Research approach
   - Data collection methods
   - Validation strategy

5. **Timeline and Milestones**
   - Phase breakdown
   - Key deliverables
   - Review points

6. **Budget Justification**
   - Personnel costs
   - Equipment/materials
   - Travel/collaboration costs

Be academic, detailed, and aligned with Saudi research priorities.`;
};

export const rdCollaborationSchema = {
  type: 'object',
  required: ['abstract_en', 'abstract_ar', 'objectives_en'],
  properties: {
    abstract_en: { type: 'string', minLength: 100 },
    abstract_ar: { type: 'string', minLength: 100 },
    objectives_en: { type: 'string' },
    objectives_ar: { type: 'string' },
    methodology_en: { type: 'string' },
    methodology_ar: { type: 'string' },
    expected_outputs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          output_en: { type: 'string' },
          output_ar: { type: 'string' },
          type: { type: 'string', enum: ['publication', 'patent', 'prototype', 'training', 'other'] }
        }
      }
    },
    timeline_milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phase: { type: 'string' },
          duration_months: { type: 'number' },
          deliverables_en: { type: 'string' },
          deliverables_ar: { type: 'string' }
        }
      }
    },
    budget_breakdown: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          amount: { type: 'number' },
          justification: { type: 'string' }
        }
      }
    }
  }
};

export const RD_COLLABORATION_SYSTEM_PROMPT = `You are a research collaboration specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You help researchers and solution providers create impactful R&D partnerships that advance municipal innovation technologies.`;
