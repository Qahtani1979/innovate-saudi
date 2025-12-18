/**
 * Contract Template Library Prompts
 * @module solutions/contractTemplate
 */

export const CONTRACT_TEMPLATE_SYSTEM_PROMPT = 'You are an expert in Saudi Arabian legal contracts and municipal procurement. Generate professional, legally-sound contract templates.';

export const buildContractTemplatePrompt = (template, solutionType) => `Generate a customized ${template.name} contract for a Saudi municipal innovation project.
Template type: ${template.type}
Required clauses: ${template.clauses.join(', ')}
Solution type: ${solutionType || 'General innovation solution'}

Generate a professional contract document in both English and Arabic that includes all required clauses. Make it specific to Saudi Arabia's regulatory environment and Vision 2030 alignment.`;

export const CONTRACT_TEMPLATE_SCHEMA = {
  type: 'object',
  properties: {
    contract_en: { type: 'string' },
    contract_ar: { type: 'string' },
    key_terms: { type: 'array', items: { type: 'string' } }
  }
};

export const CONTRACT_TEMPLATE_PROMPTS = {
  systemPrompt: CONTRACT_TEMPLATE_SYSTEM_PROMPT,
  buildPrompt: buildContractTemplatePrompt,
  schema: CONTRACT_TEMPLATE_SCHEMA
};

export default CONTRACT_TEMPLATE_PROMPTS;
