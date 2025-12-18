/**
 * Competitive Intelligence AI Prompts
 * Prompts for analyzing competitive landscape
 * @module ai/prompts/competitive/intelligence
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Competitive Analysis Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const COMPETITIVE_ANALYSIS_PROMPT_TEMPLATE = ({
  competitors,
  metrics,
  saudiPosition,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Analyze competitive landscape for Saudi municipal innovation:

Competitors: ${JSON.stringify(competitors)}
Key Metrics Comparison: ${JSON.stringify(metrics || {})}
Saudi Current Position: ${JSON.stringify(saudiPosition || {})}

Provide:
1. Strengths where Saudi leads or can leverage unique advantages
2. Critical gaps vs best-in-class global smart cities
3. Best practices to adopt from leading cities
4. Strategic recommendations aligned with Vision 2030`,
  system: `You are a global smart city competitive analyst specializing in Saudi Arabia's municipal innovation ecosystem. Provide actionable insights that leverage Saudi's unique position and resources.`,
  schema: {
    type: 'object',
    properties: {
      strengths: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Areas where Saudi leads or has advantages'
      },
      gaps: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Critical gaps vs best-in-class cities'
      },
      best_practices: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Best practices to adopt from leading cities'
      },
      recommendations: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Strategic recommendations for improvement'
      }
    },
    required: ['strengths', 'gaps', 'best_practices', 'recommendations']
  }
});

/**
 * Benchmark Comparison Prompt Template
 * @param {Object} params - Parameters for the prompt
 * @returns {Object} Complete prompt configuration
 */
export const BENCHMARK_COMPARISON_PROMPT_TEMPLATE = ({
  city1,
  city2,
  metrics,
  language = 'en'
}) => ({
  prompt: `${SAUDI_CONTEXT}

Compare innovation performance between two cities:

City 1: ${city1?.name || 'N/A'} - Metrics: ${JSON.stringify(city1?.metrics || {})}
City 2: ${city2?.name || 'N/A'} - Metrics: ${JSON.stringify(city2?.metrics || {})}

Provide detailed comparison and actionable insights for Saudi municipalities.`,
  system: `You are a municipal innovation benchmarking expert.`,
  schema: {
    type: 'object',
    properties: {
      comparison_summary: { type: 'string' },
      city1_strengths: { type: 'array', items: { type: 'string' } },
      city2_strengths: { type: 'array', items: { type: 'string' } },
      lessons_for_saudi: { type: 'array', items: { type: 'string' } }
    }
  }
});

export default {
  COMPETITIVE_ANALYSIS_PROMPT_TEMPLATE,
  BENCHMARK_COMPARISON_PROMPT_TEMPLATE
};
