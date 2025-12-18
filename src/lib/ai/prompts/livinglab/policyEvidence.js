/**
 * Lab Policy Evidence Workflow Prompts
 * @module livinglab/policyEvidence
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const POLICY_EVIDENCE_SYSTEM_PROMPT = getSystemPrompt('policy_evidence', `
You are a policy recommendation specialist for Saudi Arabia's municipal living labs.
Your role is to generate evidence-based policy recommendations from citizen science findings.
Synthesize participatory data into actionable policy insights aligned with Vision 2030.
`);

export function buildPolicyEvidencePrompt({ livingLab }) {
  return `Generate a policy recommendation based on citizen science findings from this living lab.

Living Lab: ${livingLab.name_en}
Focus Area: ${livingLab.focus_area}
Participants: ${livingLab.participant_count || 0}
Duration: ${livingLab.duration_months || 0} months
Citizen Feedback: ${livingLab.citizen_feedback_summary || 'N/A'}

Generate a policy recommendation based on citizen evidence with:
1. Title (EN + AR)
2. Evidence summary from citizen participation
3. Policy rationale
4. Implementation steps
5. Expected outcomes
6. Stakeholder impacts`;
}

export const POLICY_EVIDENCE_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    evidence_summary: {
      type: 'object',
      properties: {
        data_sources: { type: 'array', items: { type: 'string' } },
        key_findings: { type: 'array', items: { type: 'string' } },
        participation_stats: { type: 'string' },
        confidence_level: { type: 'string' }
      }
    },
    policy_rationale: { type: 'string' },
    implementation_steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string' },
          timeline: { type: 'string' },
          responsible_entity: { type: 'string' }
        }
      }
    },
    expected_outcomes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          outcome: { type: 'string' },
          measurement: { type: 'string' },
          timeline: { type: 'string' }
        }
      }
    },
    stakeholder_impacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stakeholder: { type: 'string' },
          impact_type: { type: 'string' },
          description: { type: 'string' }
        }
      }
    }
  },
  required: ['title_en', 'title_ar', 'evidence_summary', 'policy_rationale', 'implementation_steps']
};

export const POLICY_EVIDENCE_PROMPTS = {
  systemPrompt: POLICY_EVIDENCE_SYSTEM_PROMPT,
  buildPrompt: buildPolicyEvidencePrompt,
  schema: POLICY_EVIDENCE_SCHEMA
};
