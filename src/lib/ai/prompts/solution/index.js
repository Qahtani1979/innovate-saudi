/**
 * Solution Module Prompts Index
 * Central export point for all solution-related AI prompts
 * @module solution
 */

export * from './pricingSuggester';
export * from './competitiveAnalysis';
export * from './successPredictor';
export * from './complianceValidation';
export * from './marketIntelligence';

export const SOLUTION_PROMPTS_CONFIG = {
  module: 'solution',
  version: '1.0.0',
  promptCount: 5,
  prompts: [
    'pricingSuggester',
    'competitiveAnalysis',
    'successPredictor',
    'complianceValidation',
    'marketIntelligence'
  ]
};
