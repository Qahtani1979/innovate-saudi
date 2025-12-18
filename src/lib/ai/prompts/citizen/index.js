/**
 * Citizen Module Prompts Index
 * Central export point for all citizen-related AI prompts
 * @module citizen
 * @version 1.1.0
 */

export * from './ideaClassifier';
export * from './contentModeration';
export * from './proposalScreening';
export * from './feedbackAggregator';
export * from './prioritySorter';
export * from './ideaToProposal';
export * from './ideasAnalytics';

export const CITIZEN_PROMPTS_CONFIG = {
  module: 'citizen',
  version: '1.1.0',
  promptCount: 8,
  prompts: [
    'ideaClassifier',
    'contentModeration',
    'proposalScreening',
    'feedbackAggregator',
    'prioritySorter',
    'ideaToProposal',
    'ideasAnalytics',
    'ideaToRD'
  ]
};
