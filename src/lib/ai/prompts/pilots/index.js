/**
 * Pilots Module AI Prompts Index
 * @version 1.2.0
 */

// Success Pattern Analyzer
export { getSuccessPatternPrompt, successPatternSchema } from './successPattern';

// Scaling Readiness
export { getScalingReadinessPrompt, scalingReadinessSchema } from './scalingReadiness';

// Pilot Benchmarking
export { getPilotBenchmarkingPrompt, pilotBenchmarkingSchema } from './pilotBenchmarking';

// Portfolio Insights
export { getPilotPortfolioInsightsPrompt, pilotPortfolioInsightsSchema } from './portfolioInsights';

// Pilot Pivot
export { PILOT_PIVOT_SYSTEM_PROMPT, buildPilotPivotPrompt, PILOT_PIVOT_SCHEMA } from './pilotPivot';

// Pilot to Procurement
export { PILOT_PROCUREMENT_SYSTEM_PROMPT, buildPilotProcurementPrompt, PILOT_PROCUREMENT_SCHEMA } from './pilotProcurement';

// Pilot Policy & Learning
export { 
  PILOT_TO_POLICY_SYSTEM_PROMPT, buildPilotToPolicyPrompt, PILOT_TO_POLICY_SCHEMA,
  PILOT_RETROSPECTIVE_SYSTEM_PROMPT, buildPilotRetrospectivePrompt, PILOT_RETROSPECTIVE_SCHEMA,
  PILOT_LEARNING_SYSTEM_PROMPT, buildPilotLearningPrompt, PILOT_LEARNING_SCHEMA
} from './pilotPolicy';

// Pre-flight Risk & Team
export {
  PREFLIGHT_RISK_SYSTEM_PROMPT, createPreflightRiskPrompt, PREFLIGHT_RISK_SCHEMA,
  createTeamCompositionPrompt, TEAM_COMPOSITION_SCHEMA,
  createStakeholderIdentificationPrompt, STAKEHOLDER_SCHEMA,
  createTechStackPrompt, TECH_STACK_SCHEMA,
  createBudgetOptimizationPrompt, BUDGET_OPTIMIZATION_SCHEMA
} from './preflightRisk';

// Pilot Analysis
export {
  PILOT_ANALYSIS_SYSTEM_PROMPT, createPilotAnalysisPrompt, PILOT_ANALYSIS_SCHEMA
} from './pilotAnalysis';

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
  },
  pilotToPolicy: {
    promptFn: 'buildPilotToPolicyPrompt',
    schema: 'PILOT_TO_POLICY_SCHEMA',
    description: 'Generates policy recommendations from pilot results'
  },
  retrospective: {
    promptFn: 'buildPilotRetrospectivePrompt',
    schema: 'PILOT_RETROSPECTIVE_SCHEMA',
    description: 'Captures lessons learned and generates report cards'
  },
  learning: {
    promptFn: 'buildPilotLearningPrompt',
    schema: 'PILOT_LEARNING_SCHEMA',
    description: 'Extracts transferable learnings from similar pilots'
  },
  preflightRisk: {
    promptFn: 'createPreflightRiskPrompt',
    schema: 'PREFLIGHT_RISK_SCHEMA',
    description: 'Generate mitigation strategies for pilot launch'
  },
  pilotAnalysis: {
    promptFn: 'createPilotAnalysisPrompt',
    schema: 'PILOT_ANALYSIS_SCHEMA',
    description: 'Strategic insights for pilot projects'
  }
};

export default PILOTS_PROMPTS;
