/**
 * Sandbox Experiment Design Prompt Module
 * Prompts for innovation sandbox experiment design and analysis
 * @module prompts/sandbox/experimentDesign
 */

import { SAUDI_CONTEXT } from '../common/saudiContext';

/**
 * Experiment design generation prompt
 */
export const EXPERIMENT_DESIGN_PROMPT = {
  system: `You are an AI assistant specializing in innovation sandbox experiment design for Saudi Arabia.
${SAUDI_CONTEXT.VISION_2030}

Help design experiments that:
- Have clear hypotheses and success metrics
- Follow controlled testing methodology
- Minimize risk while maximizing learning
- Align with regulatory requirements
- Support evidence-based decision making`,
  
  schema: {
    type: "object",
    properties: {
      experimentName: { type: "string" },
      hypothesis: { type: "string" },
      methodology: { type: "string" },
      variables: {
        type: "object",
        properties: {
          independent: { type: "array", items: { type: "string" } },
          dependent: { type: "array", items: { type: "string" } },
          controlled: { type: "array", items: { type: "string" } }
        }
      },
      metrics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            target: { type: "string" },
            measurement: { type: "string" }
          },
          required: ["name", "type", "measurement"]
        }
      },
      timeline: {
        type: "object",
        properties: {
          duration: { type: "string" },
          phases: { type: "array", items: { type: "string" } }
        }
      },
      risks: { type: "array", items: { type: "string" } },
      mitigations: { type: "array", items: { type: "string" } }
    },
    required: ["experimentName", "hypothesis", "methodology", "metrics"]
  }
};

/**
 * Template for experiment design prompt
 */
export const EXPERIMENT_DESIGN_PROMPT_TEMPLATE = (innovation, context = {}) => ({
  ...EXPERIMENT_DESIGN_PROMPT,
  prompt: `Design a sandbox experiment for testing the following innovation:

Innovation: ${innovation.title || innovation}
Description: ${innovation.description || ''}
Sector: ${context.sector || 'General'}
Target Outcome: ${context.targetOutcome || 'Validate feasibility'}

Generate a comprehensive experiment design with clear methodology and metrics.`
});

/**
 * Experiment results analysis prompt
 */
export const EXPERIMENT_ANALYSIS_PROMPT = {
  system: `You are an AI assistant for analyzing sandbox experiment results.
Provide objective analysis with statistical rigor and actionable insights.`,
  
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      hypothesisValidated: { type: "boolean" },
      confidenceLevel: { type: "number", minimum: 0, maximum: 100 },
      keyFindings: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
      nextSteps: { type: "array", items: { type: "string" } },
      scalabilityAssessment: { type: "string" }
    },
    required: ["summary", "hypothesisValidated", "keyFindings", "recommendations"]
  }
};

export default {
  EXPERIMENT_DESIGN_PROMPT,
  EXPERIMENT_DESIGN_PROMPT_TEMPLATE,
  EXPERIMENT_ANALYSIS_PROMPT
};
