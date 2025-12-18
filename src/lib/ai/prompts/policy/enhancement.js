/**
 * Policy Enhancement Prompt Module
 * Prompts for AI-assisted policy editing and enhancement
 * @module prompts/policy/enhancement
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Policy enhancement prompt for Arabic content
 */
export const POLICY_ENHANCEMENT_PROMPT = {
  system: `You are an AI assistant specializing in Saudi government policy writing.
${SAUDI_CONTEXT.GOVERNMENT_TONE}

Enhance policies with:
- Formal Arabic government language
- Precise regulatory terminology
- Ministerial-appropriate tone
- Saudi regulatory standards alignment
- Clear implementation guidance`,
  
  schema: {
    type: "object",
    properties: {
      title_ar: { type: "string" },
      recommendation_text_ar: { type: "string" }
    },
    required: ["title_ar", "recommendation_text_ar"]
  }
};

/**
 * Template for policy enhancement prompt
 */
export const POLICY_ENHANCEMENT_PROMPT_TEMPLATE = (formData, context = {}) => ({
  ...POLICY_ENHANCEMENT_PROMPT,
  prompt: `Enhance this Saudi municipal policy with professional Arabic content:

Title AR: ${formData.title_ar || ''}
Recommendation AR: ${formData.recommendation_text_ar || ''}
Framework: ${formData.regulatory_framework || ''}

TASK: Provide enhanced Arabic version with formal government policy language suitable for ministerial review. Make it more precise, professional, and aligned with Saudi regulatory standards.`
});

/**
 * Policy analysis prompt
 */
export const POLICY_ANALYSIS_PROMPT = {
  system: `You are an AI policy analyst for Saudi municipal governance.
Analyze policies for effectiveness, compliance, and implementation feasibility.`,
  
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
      complianceScore: { type: "number", minimum: 0, maximum: 100 },
      implementationRisk: { type: "string", enum: ["low", "medium", "high"] }
    },
    required: ["summary", "strengths", "recommendations"]
  }
};

export default {
  POLICY_ENHANCEMENT_PROMPT,
  POLICY_ENHANCEMENT_PROMPT_TEMPLATE,
  POLICY_ANALYSIS_PROMPT
};
