/**
 * AI Proposal Writer Prompts
 * For generating comprehensive R&D proposals from initial ideas
 */

import { getSystemPrompt } from '@/lib/saudiContext';
import { buildBilingualSchema } from '../../bilingualSchemaBuilder';

export const PROPOSAL_WRITER_PROMPTS = {
  systemPrompt: getSystemPrompt('rd_proposal_writer'),
  
  buildPrompt: (userThoughts, rdCallContext = null) => `You are an academic research proposal writer specializing in municipal innovation.

RESEARCHER'S INITIAL THOUGHTS:
${userThoughts}

${rdCallContext ? `R&D CALL CONTEXT:
Call Title: ${rdCallContext.title_en}
Focus Areas: ${rdCallContext.focus_areas?.join(', ')}
Budget Range: ${rdCallContext.budget_min} - ${rdCallContext.budget_max} SAR
` : ''}

Generate a comprehensive, publication-quality R&D proposal with:

1. RESEARCH TITLE (EN + AR)
   - Compelling and academic
   - Reflects innovation and impact

2. ABSTRACT (EN + AR)
   - 250 words maximum
   - Problem statement
   - Proposed approach
   - Expected impact on Saudi municipalities

3. RESEARCH OBJECTIVES (EN + AR)
   - Specific, measurable objectives
   - Aligned with Vision 2030

4. METHODOLOGY (EN + AR)
   - Detailed research approach
   - Data collection methods
   - Analysis techniques

5. EXPECTED OUTPUTS
   - Publications, datasets, prototypes
   - Technology deliverables
   - Timeline for each output

6. PROJECT TIMELINE
   - 12-18 months breakdown
   - Clear phases and deliverables

7. BUDGET BREAKDOWN
   - Category allocations with justifications
   - Personnel, equipment, materials, travel

8. TEAM REQUIREMENTS
   - Required roles and expertise
   - Recommended team composition

9. RISK ASSESSMENT
   - Identified risks
   - Mitigation strategies

Make this fundable and aligned with Saudi municipal innovation priorities.`,

  schema: buildBilingualSchema({
    type: 'object',
    properties: {
      title_en: { type: 'string' },
      title_ar: { type: 'string' },
      abstract_en: { type: 'string' },
      abstract_ar: { type: 'string' },
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
            type: { type: 'string' },
            target_date: { type: 'string' }
          },
          required: ['output_en', 'type', 'target_date']
        }
      },
      timeline: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            phase: { type: 'string' },
            duration_months: { type: 'number' },
            deliverables: { type: 'array', items: { type: 'string' } }
          },
          required: ['phase', 'duration_months', 'deliverables']
        }
      },
      budget_breakdown: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category_en: { type: 'string' },
            category_ar: { type: 'string' },
            amount: { type: 'number' },
            justification: { type: 'string' }
          },
          required: ['category_en', 'amount', 'justification']
        }
      },
      team_requirements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            role_en: { type: 'string' },
            role_ar: { type: 'string' },
            expertise: { type: 'array', items: { type: 'string' } }
          },
          required: ['role_en', 'expertise']
        }
      },
      risks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string' },
            mitigation: { type: 'string' }
          },
          required: ['risk', 'mitigation']
        }
      }
    },
    required: ['title_en', 'title_ar', 'abstract_en', 'abstract_ar', 'objectives_en', 'methodology_en', 'expected_outputs', 'timeline', 'budget_breakdown']
  })
};

export default PROPOSAL_WRITER_PROMPTS;
