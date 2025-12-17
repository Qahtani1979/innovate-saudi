/**
 * Contract Generator Prompt
 * Used by: ContractGeneratorWizard.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildContractGeneratorPrompt = (solution, pilot) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are generating a comprehensive solution deployment contract for Saudi Arabia's municipal innovation ecosystem.

## CONTRACT CONTEXT

### Solution Details
- Name: ${solution?.name_en}
- Description: ${solution?.description_en}
- Provider: ${solution?.provider_name}
- TRL: ${solution?.trl || 'N/A'}

### Pilot Details
- Title: ${pilot?.title_en}
- Budget: ${pilot?.budget || 0} SAR
- Duration: ${pilot?.duration_weeks || 12} weeks
- Municipality: ${pilot?.municipality_id}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## GENERATE CONTRACT COMPONENTS

1. **Terms and Conditions** (Arabic + English)
   - Scope of work
   - Rights and obligations
   - Liability and indemnification
   - Confidentiality clauses
   - Termination conditions

2. **Deliverables** (5-7 items)
   - Deliverable name
   - Due date (relative to contract start)
   - Acceptance criteria

3. **Payment Milestones** (4-5 milestones)
   - Milestone name
   - Amount (percentage of total)
   - Trigger (deliverable completion)

4. **KPIs and Success Criteria**
   - Measurable performance indicators
   - Target values
   - Measurement methodology

5. **Support and Maintenance Terms**
   - Support hours and response times
   - Maintenance schedule
   - Warranty period`;
};

export const contractGeneratorSchema = {
  type: 'object',
  required: ['terms_en', 'terms_ar', 'deliverables'],
  properties: {
    terms_en: { type: 'string', minLength: 200 },
    terms_ar: { type: 'string', minLength: 200 },
    deliverables: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          deliverable_name: { type: 'string' },
          due_date: { type: 'string' },
          status: { type: 'string' },
          acceptance_criteria: { type: 'string' }
        }
      }
    },
    payment_milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          milestone_name: { type: 'string' },
          amount: { type: 'number' },
          percentage: { type: 'number' },
          due_date: { type: 'string' },
          trigger: { type: 'string' }
        }
      }
    },
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          target: { type: 'string' },
          measurement: { type: 'string' }
        }
      }
    },
    support_terms_en: { type: 'string' },
    support_terms_ar: { type: 'string' }
  }
};

export const CONTRACT_GENERATOR_SYSTEM_PROMPT = `You are a legal and procurement specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You generate comprehensive solution deployment contracts that protect both parties while facilitating successful innovation implementation.`;
