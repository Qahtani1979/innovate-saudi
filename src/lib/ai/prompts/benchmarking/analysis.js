/**
 * Benchmarking Analysis Prompt Module
 * Prompts for comparative analysis and benchmarking
 * @module prompts/benchmarking/analysis
 */

import { SAUDI_CONTEXT } from '@/lib/ai/prompts/common/saudiContext';

/**
 * Benchmarking analysis prompt
 */
export const BENCHMARKING_ANALYSIS_PROMPT = {
  system: `You are an AI assistant specializing in benchmarking analysis for Saudi municipal innovation.
${SAUDI_CONTEXT.VISION_2030}

Provide comparative analysis that:
- Identifies performance gaps and opportunities
- Considers local context and constraints
- References international best practices
- Suggests actionable improvements
- Aligns with Vision 2030 objectives`,
  
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      performanceScore: { type: "number", minimum: 0, maximum: 100 },
      rankings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            dimension: { type: "string" },
            score: { type: "number" },
            benchmark: { type: "number" },
            gap: { type: "number" },
            trend: { type: "string", enum: ["improving", "stable", "declining"] }
          },
          required: ["dimension", "score", "benchmark"]
        }
      },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      opportunities: { type: "array", items: { type: "string" } },
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: { type: "string" },
            action: { type: "string" },
            impact: { type: "string", enum: ["low", "medium", "high"] },
            effort: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["area", "action", "impact"]
        }
      }
    },
    required: ["summary", "performanceScore", "rankings", "recommendations"]
  }
};

/**
 * Template for benchmarking analysis prompt
 */
export const BENCHMARKING_ANALYSIS_PROMPT_TEMPLATE = (entity, metrics, context = {}) => ({
  ...BENCHMARKING_ANALYSIS_PROMPT,
  prompt: `Perform benchmarking analysis for:

Entity: ${entity.name || entity}
Type: ${entity.type || 'Municipality'}
Region: ${context.region || 'Saudi Arabia'}

Current Metrics:
${JSON.stringify(metrics, null, 2)}

Benchmark Against: ${context.benchmarkType || 'National average and international best practices'}

Provide comprehensive comparative analysis with actionable recommendations.`
});

/**
 * Peer comparison prompt
 */
export const PEER_COMPARISON_PROMPT = {
  system: `You are an AI assistant for peer comparison analysis.
Compare entities fairly while highlighting unique strengths and improvement areas.`,
  
  schema: {
    type: "object",
    properties: {
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            overallScore: { type: "number" },
            rank: { type: "number" },
            highlights: { type: "array", items: { type: "string" } }
          },
          required: ["name", "overallScore", "rank"]
        }
      },
      insights: { type: "array", items: { type: "string" } },
      bestPractices: { type: "array", items: { type: "string" } }
    },
    required: ["entities", "insights"]
  }
};

export default {
  BENCHMARKING_ANALYSIS_PROMPT,
  BENCHMARKING_ANALYSIS_PROMPT_TEMPLATE,
  PEER_COMPARISON_PROMPT
};
