/**
 * Citizen Module Prompts Index
 * Central export point for all citizen-related AI prompts
 * @module citizen
 */

export * from './ideaClassifier';
export * from './contentModeration';
export * from './proposalScreening';
export * from './feedbackAggregator';
export * from './prioritySorter';
export * from './ideaToProposal';

export const CITIZEN_PROMPTS_CONFIG = {
  module: 'citizen',
  version: '1.0.0',
  promptCount: 5,
  prompts: [
    'ideaClassifier',
    'contentModeration',
    'proposalScreening',
    'feedbackAggregator',
    'prioritySorter'
  ]
};
