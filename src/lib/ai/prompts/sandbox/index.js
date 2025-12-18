/**
 * Sandbox Module AI Prompts Index
 * @version 1.2.0
 */

// Regulatory Gap Analyzer
export { getRegulatoryGapAnalyzerPrompt, regulatoryGapAnalyzerSchema } from './regulatoryGapAnalyzer';

// Fast-Track Eligibility
export { getFastTrackEligibilityPrompt, fastTrackEligibilitySchema } from './fastTrackEligibility';

// Sandbox Design
export { getSandboxDesignPrompt, sandboxDesignSchema } from './sandboxDesign';

// Auto Risk Router
export { getAutoRiskRouterPrompt, autoRiskRouterSchema } from './autoRiskRouter';

// Policy Feedback
export { getPolicyFeedbackPrompt, policyFeedbackSchema } from './policyFeedback';

// Incident Report
export { buildIncidentReportPrompt, INCIDENT_REPORT_SYSTEM_PROMPT } from './incidentReport';

// Risk Assessment
export { buildRiskAssessmentPrompt, RISK_ASSESSMENT_SCHEMA, RISK_ASSESSMENT_SYSTEM_PROMPT } from './riskAssessment';

// Safety Protocol
export { buildSafetyProtocolPrompt, SAFETY_PROTOCOL_SCHEMA, SAFETY_PROTOCOL_SYSTEM_PROMPT } from './safetyProtocol';

// Sandbox Enhancement & Analysis
export {
  SANDBOX_ENHANCE_SYSTEM_PROMPT, createSandboxEnhancePrompt, SANDBOX_ENHANCE_SCHEMA,
  createSandboxAnalysisPrompt, SANDBOX_ANALYSIS_SCHEMA
} from './enhance';

/**
 * Sandbox module prompt configuration
 */
export const SANDBOX_PROMPTS = {
  regulatoryGapAnalyzer: {
    promptFn: 'getRegulatoryGapAnalyzerPrompt',
    schema: 'regulatoryGapAnalyzerSchema',
    description: 'Analyzes regulatory compliance gaps'
  },
  fastTrackEligibility: {
    promptFn: 'getFastTrackEligibilityPrompt',
    schema: 'fastTrackEligibilitySchema',
    description: 'Checks fast-track eligibility'
  },
  sandboxDesign: {
    promptFn: 'getSandboxDesignPrompt',
    schema: 'sandboxDesignSchema',
    description: 'Generates complete sandbox design'
  },
  autoRiskRouter: {
    promptFn: 'getAutoRiskRouterPrompt',
    schema: 'autoRiskRouterSchema',
    description: 'Routes entities based on risk'
  },
  policyFeedback: {
    promptFn: 'getPolicyFeedbackPrompt',
    schema: 'policyFeedbackSchema',
    description: 'Generates policy recommendations'
  },
  incidentReport: {
    promptFn: 'buildIncidentReportPrompt',
    systemPrompt: 'INCIDENT_REPORT_SYSTEM_PROMPT',
    description: 'Generates incident reports'
  },
  riskAssessment: {
    promptFn: 'buildRiskAssessmentPrompt',
    schema: 'RISK_ASSESSMENT_SCHEMA',
    description: 'Comprehensive risk assessment'
  },
  safetyProtocol: {
    promptFn: 'buildSafetyProtocolPrompt',
    schema: 'SAFETY_PROTOCOL_SCHEMA',
    description: 'Safety protocol generation'
  },
  sandboxEnhance: {
    promptFn: 'createSandboxEnhancePrompt',
    schema: 'SANDBOX_ENHANCE_SCHEMA',
    description: 'Enhance sandbox proposals'
  },
  sandboxAnalysis: {
    promptFn: 'createSandboxAnalysisPrompt',
    schema: 'SANDBOX_ANALYSIS_SCHEMA',
    description: 'Analyze sandbox portfolio'
  }
};

export default SANDBOX_PROMPTS;
