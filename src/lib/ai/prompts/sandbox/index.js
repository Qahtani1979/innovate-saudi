/**
 * Sandbox Module AI Prompts Index
 * @version 1.0.0
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
  }
};

export default SANDBOX_PROMPTS;
