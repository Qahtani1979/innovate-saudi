/**
 * Contract Analysis AI Prompts
 * @module prompts/contracts/contractAnalysis
 * @version 1.1.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Contract risk analysis prompt
 */
export const CONTRACT_RISK_PROMPT_TEMPLATE = (contract) => `
Analyze contract risks and compliance for Saudi municipal context:

Contract: ${contract.title_en || contract.title}
Type: ${contract.contract_type || 'general'}
Value: ${contract.value || 0} ${contract.currency || 'SAR'}
Duration: ${contract.start_date} to ${contract.end_date}
Status: ${contract.status || 'draft'}

Parties:
- Party A: ${contract.party_a_id} (${contract.party_a_type})
- Party B: ${contract.party_b_id} (${contract.party_b_type})

Terms: ${contract.terms_conditions || 'Not specified'}

${SAUDI_CONTEXT.COMPACT}

Analyze:
1. Compliance Risks
2. Financial Risks
3. Performance Risks
4. Legal Considerations
5. Recommendations
`;

/**
 * Contract performance tracking prompt
 */
export const CONTRACT_PERFORMANCE_PROMPT_TEMPLATE = (contract, deliverables) => `
Assess contract performance and deliverable tracking:

Contract: ${contract.title_en || contract.title}
Value: ${contract.value || 0} ${contract.currency || 'SAR'}
Progress: ${contract.completion_percentage || 0}%

Deliverables:
${deliverables?.map(d => `- ${d.name}: ${d.status} (Due: ${d.due_date})`).join('\n') || 'None specified'}

${SAUDI_CONTEXT.COMPACT}

Provide:
1. Performance Score (0-100)
2. Deliverable Status Assessment
3. Timeline Variance Analysis
4. Budget Utilization
5. Risk Mitigation Recommendations
`;

export const CONTRACT_ANALYSIS_SYSTEM_PROMPT = `You are a contract analyst specializing in Saudi Arabian government procurement and municipal contracts. Provide risk assessment and performance analysis aligned with Saudi regulations.`;

export const CONTRACT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    performanceScore: { type: "number", description: 'Contract performance score 0-100' },
    complianceRisks: { type: "array", items: { type: "string" }, description: 'Compliance risks identified' },
    complianceRisks_ar: { type: "array", items: { type: "string" }, description: 'Arabic compliance risks' },
    financialRisks: { type: "array", items: { type: "string" }, description: 'Financial risks identified' },
    financialRisks_ar: { type: "array", items: { type: "string" }, description: 'Arabic financial risks' },
    recommendations: { type: "array", items: { type: "string" }, description: 'Risk mitigation recommendations' },
    recommendations_ar: { type: "array", items: { type: "string" }, description: 'Arabic recommendations' },
    riskLevel: { type: "string", enum: ['low', 'medium', 'high', 'critical'], description: 'Overall risk level' }
  },
  required: ["performanceScore", "complianceRisks", "financialRisks", "recommendations", "riskLevel"]
};
