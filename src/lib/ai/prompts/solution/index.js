/**
 * Solution Module Prompts Index
 * Central export point for all solution-related AI prompts
 * @module solution
 */

export * from './pricingSuggester';
// export * from './competitiveAnalysis'; // Deprecated
// export * from './successPredictor'; // Deprecated
export * from './complianceValidation';
export * from './marketIntelligence';
export * from './automatedMatching';
export * from './contractGenerator';
export * from './rdCollaboration';
export * from './competitiveAnalysisWidget';

export const SOLUTION_PROMPTS_CONFIG = {
  module: 'solution',
  version: '1.1.0',
  promptCount: 9,
  prompts: [
    'pricingSuggester',
    'competitiveAnalysis',
    'successPredictor',
    'complianceValidation',
    'marketIntelligence',
    'automatedMatching',
    'contractGenerator',
    'rdCollaboration',
    'competitiveAnalysisWidget'
  ]
};
