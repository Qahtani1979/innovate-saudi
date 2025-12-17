/**
 * Agreement Generator Prompt
 * Used by: AIAgreementGenerator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildAgreementGeneratorPrompt = (partnership) => {
  const parties = partnership.parties?.map(p => p.organization_name).join(', ') || 'TBD';
  
  return `${SAUDI_CONTEXT.COMPACT}

You are generating a bilingual MOU (Memorandum of Understanding) for a Saudi municipal innovation partnership.

## PARTNERSHIP DETAILS

### Partnership Type
${partnership.partnership_type || 'Strategic'}

### Parties Involved
${parties}

### Scope of Collaboration
${partnership.scope_en || 'To be defined'}

### Duration
From: ${partnership.start_date || 'TBD'}
To: ${partnership.end_date || 'TBD'}

### Budget
${partnership.budget_shared || 'TBD'} SAR

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## MOU REQUIREMENTS
Generate a professional bilingual MOU including:
1. Introduction and purpose (Arabic and English)
2. Scope of collaboration
3. Roles and responsibilities per party
4. Deliverables and milestones
5. Budget and resource allocation
6. IP rights and confidentiality clauses
7. Term and termination clauses
8. Signatures section

Ensure the agreement:
- Complies with Saudi legal standards
- Uses formal government document language
- Is balanced and fair to all parties
- Includes Vision 2030 alignment where relevant`;
};

export const agreementGeneratorSchema = {
  type: 'object',
  required: ['mou_en', 'mou_ar'],
  properties: {
    mou_en: { type: 'string', minLength: 500 },
    mou_ar: { type: 'string', minLength: 500 },
    key_terms: { type: 'array', items: { type: 'string' } }
  }
};

export const AGREEMENT_GENERATOR_SYSTEM_PROMPT = `You are a legal document specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You generate professional bilingual MOUs and partnership agreements that comply with Saudi legal standards and government document requirements.`;
