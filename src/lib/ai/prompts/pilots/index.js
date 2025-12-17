/**
 * Pilots Module AI Prompts Index
 * @version 1.0.0
 */

// Success Pattern Analyzer
export { getSuccessPatternPrompt, successPatternSchema } from './successPattern';

// Scaling Readiness
export { getScalingReadinessPrompt, scalingReadinessSchema } from './scalingReadiness';

// Pilot Benchmarking
export { getPilotBenchmarkingPrompt, pilotBenchmarkingSchema } from './pilotBenchmarking';

// Portfolio Insights
export { getPilotPortfolioInsightsPrompt, pilotPortfolioInsightsSchema } from './portfolioInsights';

/**
 * Pilots module prompt configuration
 */
export const PILOTS_PROMPTS = {
  successPattern: {
    promptFn: 'getSuccessPatternPrompt',
    schema: 'successPatternSchema',
    description: 'Analyzes successful pilots to identify patterns'
  },
  scalingReadiness: {
    promptFn: 'getScalingReadinessPrompt',
    schema: 'scalingReadinessSchema',
    description: 'Assesses pilot readiness for scaling'
  },
  benchmarking: {
    promptFn: 'getPilotBenchmarkingPrompt',
    schema: 'pilotBenchmarkingSchema',
    description: 'Compares pilot against similar pilots'
  },
  portfolioInsights: {
    promptFn: 'getPilotPortfolioInsightsPrompt',
    schema: 'pilotPortfolioInsightsSchema',
    description: 'Strategic analysis of pilot portfolio'
  }
};

export default PILOTS_PROMPTS;
