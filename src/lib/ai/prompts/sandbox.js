/**
 * Regulatory Sandbox Analysis Prompt Module
 * Regulatory gap analysis and compliance assessment
 * @module prompts/sandbox
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Regulatory gap analyzer prompt template
 * @param {Object} application - Sandbox application data
 * @returns {Object} Prompt configuration
 */
export const REGULATORY_GAP_ANALYZER_PROMPT_TEMPLATE = ({ application }) => ({
  system: `You are an expert Regulatory Compliance Analyst for Saudi Arabia's regulatory sandbox ecosystem.
${SAUDI_CONTEXT.VISION_2030}

Your expertise covers:
- SAMA (Saudi Central Bank) regulations
- CST (Communications, Space & Technology Commission) frameworks
- SFDA (Saudi Food & Drug Authority) guidelines
- CITC (Communications & IT Commission) standards
- Other relevant Saudi regulatory bodies

Analyze innovative projects for regulatory conflicts and exemption requirements.`,

  prompt: `Analyze this sandbox application for regulatory compliance:

PROJECT DETAILS:
- Title: ${application?.title || 'Unknown'}
- Description: ${application?.description || 'No description provided'}
- Sector: ${application?.sector || 'General'}
- Technology: ${application?.technology || 'Unspecified'}
- Proposed Location: ${application?.location || 'KSA General'}
- Innovation Type: ${application?.innovation_type || 'Not specified'}

ANALYSIS REQUIREMENTS:
1. Identify specific Saudi regulations that may conflict with this innovation
2. Assess overall regulatory risk level (low, medium, high)
3. List specific exemptions needed for safe piloting
4. Estimate approval timeline based on similar precedents
5. Cite relevant precedent cases in KSA or MENA region

Output valid JSON.`,

  schema: {
    type: "object",
    properties: {
      risk_level: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Overall regulatory risk assessment"
      },
      required_exemptions: {
        type: "array",
        items: { type: "string" },
        description: "Specific regulatory exemptions needed"
      },
      estimated_approval_weeks: {
        type: "integer",
        minimum: 1,
        description: "Estimated approval timeline in weeks"
      },
      conflicts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            regulation: { type: "string", description: "Regulation name/code" },
            authority: { type: "string", description: "Regulatory authority (e.g., SAMA, SFDA)" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            conflict_description: { type: "string" }
          },
          required: ["regulation", "severity", "conflict_description"]
        }
      },
      precedents: {
        type: "array",
        items: { type: "string" },
        description: "Similar approved cases or precedents"
      }
    },
    required: ["risk_level", "required_exemptions", "estimated_approval_weeks", "conflicts"]
  }
});

export default {
  REGULATORY_GAP_ANALYZER_PROMPT_TEMPLATE
};
