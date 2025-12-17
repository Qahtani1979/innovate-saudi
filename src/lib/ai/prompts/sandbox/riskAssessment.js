/**
 * Risk Assessment Prompts
 * AI-powered comprehensive risk assessment for sandbox applications
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for risk assessment
 */
export const RISK_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('risk_assessment', `
You are an expert risk assessor for Saudi municipal innovation sandboxes.

ASSESSMENT GUIDELINES:
1. Evaluate all risk categories objectively
2. Consider Saudi regulatory context
3. Provide actionable mitigation strategies
4. Balance innovation support with safety
5. Follow Vision 2030 principles
`);

/**
 * Build risk assessment prompt
 * @param {Object} params - Assessment parameters
 * @returns {string} Formatted prompt
 */
export function buildRiskAssessmentPrompt({ application, sandbox }) {
  return `Perform comprehensive risk assessment for this sandbox application:

Sandbox: ${sandbox.name_en} (${sandbox.domain})
Project: ${application.project_title}
Organization: ${application.applicant_organization}
Duration: ${application.duration_months} months
Requested Exemptions: ${JSON.stringify(application.requested_exemptions)}
Risk Assessment: ${application.risk_assessment}
Safety Plan: ${application.public_safety_plan}

Analyze:
1. Safety risks (public, operational, environmental)
2. Regulatory compliance risks
3. Technical failure risks
4. Reputational risks
5. Financial risks

Provide JSON with risk scores, mitigation strategies, and approval recommendation.`;
}

/**
 * Response schema for risk assessment
 */
export const RISK_ASSESSMENT_SCHEMA = {
  type: "object",
  properties: {
    overall_risk_score: { type: "number", description: "0-100" },
    risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    risk_breakdown: {
      type: "object",
      properties: {
        safety_risk: { type: "number" },
        compliance_risk: { type: "number" },
        technical_risk: { type: "number" },
        reputational_risk: { type: "number" },
        financial_risk: { type: "number" }
      }
    },
    key_risks: {
      type: "array",
      items: { type: "string" }
    },
    mitigation_strategies: {
      type: "array",
      items: { type: "string" }
    },
    recommendation: {
      type: "string",
      enum: ["approve", "conditional_approve", "reject", "request_more_info"]
    },
    recommendation_rationale: { type: "string" },
    required_conditions: {
      type: "array",
      items: { type: "string" }
    },
    monitoring_requirements: {
      type: "array",
      items: { type: "string" }
    }
  }
};
