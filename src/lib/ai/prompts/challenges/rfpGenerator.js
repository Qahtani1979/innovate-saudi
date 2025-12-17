/**
 * RFP Generator Prompt
 * Used by: ChallengeRFPGenerator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildRFPGeneratorPrompt = (challenge, customRequirements = '') => {
  return `${SAUDI_CONTEXT.COMPACT}

You are generating a professional RFP (Request for Proposal) for a Saudi municipal challenge.

## CHALLENGE DETAILS

**Title:** ${challenge.title_en}
${challenge.title_ar ? `**العنوان:** ${challenge.title_ar}` : ''}
**Description:** ${challenge.description_en || 'Not specified'}
**Sector:** ${challenge.sector || 'General'}
**Municipality:** ${challenge.municipality_id || 'Not specified'}
**Impact Score:** ${challenge.impact_score || 'TBD'}/100
**Budget Estimate:** ${challenge.budget_estimate ? `${challenge.budget_estimate.toLocaleString()} SAR` : 'TBD'}

${customRequirements ? `## ADDITIONAL REQUIREMENTS\n${customRequirements}` : ''}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## RFP STRUCTURE
Generate a structured RFP including:
1. Executive Summary (bilingual)
2. Challenge Background & Context
3. Scope of Work
4. Technical Requirements (5-8 items)
5. Evaluation Criteria (4-6 with weights totaling 100%)
6. Submission Requirements (4-6 items)
7. Timeline & Milestones
8. Budget Guidelines

Ensure compliance with Saudi procurement regulations and Vision 2030 objectives.`;
};

export const rfpGeneratorSchema = {
  type: 'object',
  required: ['rfp_code', 'executive_summary_en', 'executive_summary_ar', 'scope_of_work', 'technical_requirements', 'evaluation_criteria', 'submission_requirements', 'timeline_weeks'],
  properties: {
    rfp_code: { 
      type: 'string',
      description: 'Unique RFP identifier (e.g., RFP-2024-001)'
    },
    executive_summary_en: { 
      type: 'string',
      description: 'Executive summary in English (150-250 words)'
    },
    executive_summary_ar: { 
      type: 'string',
      description: 'Executive summary in Arabic (الملخص التنفيذي)'
    },
    scope_of_work: { 
      type: 'string',
      description: 'Detailed scope of work description'
    },
    technical_requirements: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'List of technical requirements'
    },
    evaluation_criteria: {
      type: 'array',
      items: {
        type: 'object',
        required: ['criterion', 'weight', 'description'],
        properties: {
          criterion: { type: 'string' },
          weight: { type: 'number' },
          description: { type: 'string' }
        }
      },
      description: 'Evaluation criteria with weights'
    },
    submission_requirements: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Proposal submission requirements'
    },
    timeline_weeks: { 
      type: 'number',
      description: 'Expected implementation timeline in weeks'
    },
    budget_range_min: { 
      type: 'number',
      description: 'Minimum budget in SAR'
    },
    budget_range_max: { 
      type: 'number',
      description: 'Maximum budget in SAR'
    }
  }
};

export const RFP_GENERATOR_SYSTEM_PROMPT = `You are a procurement specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You create professional, compliant RFPs that attract quality vendors while ensuring alignment with Vision 2030 objectives and Saudi procurement regulations.`;
