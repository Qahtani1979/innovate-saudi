/**
 * Procurement and contract prompts
 * @module procurement/contracts
 */

export const PROCUREMENT_SYSTEM_PROMPT = `You are an expert in Saudi government procurement and contract management for municipal innovation projects.`;

export const createRFPGeneratorPrompt = (project, requirements) => `Generate an RFP (Request for Proposal) for this project:

Project: ${project.title_en}
Description: ${project.description_en}
Budget: ${project.budget} ${project.budget_currency || 'SAR'}
Timeline: ${project.timeline || 'TBD'}
Requirements: ${JSON.stringify(requirements)}

Generate RFP sections in BOTH English AND Arabic:
1. Project Overview
2. Scope of Work
3. Technical Requirements
4. Evaluation Criteria
5. Submission Guidelines
6. Terms and Conditions`;

export const RFP_SCHEMA = {
  type: 'object',
  properties: {
    project_overview_en: { type: 'string' },
    project_overview_ar: { type: 'string' },
    scope_of_work_en: { type: 'string' },
    scope_of_work_ar: { type: 'string' },
    technical_requirements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          requirement_en: { type: 'string' },
          requirement_ar: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    evaluation_criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion_en: { type: 'string' },
          criterion_ar: { type: 'string' },
          weight: { type: 'number' }
        }
      }
    },
    submission_guidelines_en: { type: 'string' },
    submission_guidelines_ar: { type: 'string' },
    terms_conditions_en: { type: 'string' },
    terms_conditions_ar: { type: 'string' }
  }
};

export const createContractAnalysisPrompt = (contract) => `Analyze this contract for risks and compliance:

Contract Details:
${JSON.stringify(contract, null, 2)}

Analyze:
1. Key terms and obligations
2. Risk areas
3. Compliance with Saudi regulations
4. Recommendations for negotiation`;

export const CONTRACT_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    key_terms: { type: 'array', items: { type: 'string' } },
    obligations: { type: 'array', items: { type: 'string' } },
    risk_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_en: { type: 'string' },
          risk_ar: { type: 'string' },
          severity: { type: 'string' },
          mitigation: { type: 'string' }
        }
      }
    },
    compliance_status: { type: 'string' },
    compliance_gaps: { type: 'array', items: { type: 'string' } },
    negotiation_recommendations_en: { type: 'array', items: { type: 'string' } },
    negotiation_recommendations_ar: { type: 'array', items: { type: 'string' } }
  }
};
