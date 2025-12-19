/**
 * Municipality AI Prompts Index
 * Centralized exports for all municipality-related AI prompts
 * @version 1.0.0
 */

// Municipality Analysis
export {
  MUNICIPALITY_PERFORMANCE_PROMPT_TEMPLATE,
  MUNICIPALITY_BENCHMARK_PROMPT_TEMPLATE,
  MUNICIPALITY_ANALYSIS_SYSTEM_PROMPT,
  MUNICIPALITY_ANALYSIS_SCHEMA
} from './municipalityAnalysis';

// Municipality Creation
export {
  MUNICIPALITY_CREATE_SYSTEM_PROMPT,
  MUNICIPALITY_CREATE_PROMPT_TEMPLATE,
  MUNICIPALITY_CREATE_RESPONSE_SCHEMA
} from './creation';

// Municipality Profile Analysis
export {
  MUNICIPALITY_ANALYSIS_SYSTEM_PROMPT as MUNICIPALITY_PROFILE_SYSTEM_PROMPT,
  MUNICIPALITY_INSIGHTS_PROMPT_TEMPLATE,
  MUNICIPALITY_INSIGHTS_RESPONSE_SCHEMA
} from './profileAnalysis';

// MII Improvement
export {
  MII_IMPROVEMENT_SYSTEM_PROMPT,
  buildMIIImprovementPrompt as MII_IMPROVEMENT_PROMPT_TEMPLATE,
  MII_IMPROVEMENT_SCHEMA as MII_IMPROVEMENT_RESPONSE_SCHEMA,
  MII_IMPROVEMENT_PROMPTS
} from './miiImprovement';

// Capacity Planning
export * from './capacityPlanning';

// Default export with all prompts
export default {
  // Analysis
  MUNICIPALITY_PERFORMANCE_PROMPT_TEMPLATE: async () => (await import('./municipalityAnalysis')).MUNICIPALITY_PERFORMANCE_PROMPT_TEMPLATE,
  MUNICIPALITY_BENCHMARK_PROMPT_TEMPLATE: async () => (await import('./municipalityAnalysis')).MUNICIPALITY_BENCHMARK_PROMPT_TEMPLATE,
  
  // Creation
  MUNICIPALITY_CREATE_PROMPT_TEMPLATE: async () => (await import('./creation')).MUNICIPALITY_CREATE_PROMPT_TEMPLATE,
  
  // Profile
  MUNICIPALITY_INSIGHTS_PROMPT_TEMPLATE: async () => (await import('./profileAnalysis')).MUNICIPALITY_INSIGHTS_PROMPT_TEMPLATE,
  
  // MII
  MII_IMPROVEMENT_PROMPT_TEMPLATE: async () => (await import('./miiImprovement')).buildMIIImprovementPrompt
};
