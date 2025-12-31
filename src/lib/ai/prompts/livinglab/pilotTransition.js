/**
 * Lab to Pilot Transition Assessment Prompt
 * Evaluates readiness for transitioning lab projects to pilot phase
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build pilot transition assessment prompt
 */
export function buildPilotTransitionPrompt(labProject) {
  return `${SAUDI_CONTEXT.INNOVATION}

You are an AI innovation lifecycle specialist for Saudi Arabian municipal innovation programs.

LAB PROJECT TO ASSESS:
- Title: ${labProject?.title_en || 'Unknown Project'}
- Title (AR): ${labProject?.title_ar || 'غير محدد'}
- Results Summary: ${labProject?.results_summary || 'No results documented yet'}
- Technology Readiness Level (TRL): ${labProject?.trl || 4}
- Duration in Lab: ${labProject?.duration || 'Not specified'}
- Key Findings: ${labProject?.key_findings?.join(', ') || 'None documented'}

TASK: Assess this project's readiness to transition from lab testing to pilot deployment.

EVALUATION CRITERIA:
1. Technical Readiness (0-100%) - Is the technology proven?
2. Regulatory Status - What approvals are needed?
3. Budget Requirements - Estimated pilot costs
4. Recommended Municipalities - Which municipalities would be good pilots?
5. Risk Factors - What could go wrong in pilot phase?

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Consider Saudi Vision 2030 alignment and municipal innovation priorities.`;
}

/**
 * Get response schema for pilot transition assessment
 */
export function getPilotTransitionSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      readiness_score: { type: 'number', description: 'Overall readiness 0-100' },
      technical_readiness: { type: 'number', description: 'Technical maturity 0-100' },
      regulatory_status: { type: 'string', description: 'Current regulatory status' },
      regulatory_status_ar: { type: 'string', description: 'Arabic regulatory status' },
      budget_estimate: { type: 'string', description: 'Estimated pilot budget' },
      budget_estimate_ar: { type: 'string', description: 'Arabic budget estimate' },
      municipalities: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Recommended pilot municipalities'
      },
      municipalities_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic municipality names'
      },
      risks: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Risk factors'
      },
      risks_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic risk factors'
      },
      next_steps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Recommended next steps'
      },
      next_steps_ar: {
        type: 'array',
        items: { type: 'string' },
        description: 'Arabic next steps'
      }
    },
    required: ['readiness_score', 'technical_readiness', 'regulatory_status', 'budget_estimate', 'municipalities', 'risks', 'next_steps']
  });
}

export const PILOT_TRANSITION_SYSTEM_PROMPT = `You are an AI innovation lifecycle specialist for Saudi Arabian municipal programs. You assess project readiness for pilot deployment with expertise in regulatory requirements, budget estimation, and risk assessment. Always provide bilingual responses.`;
