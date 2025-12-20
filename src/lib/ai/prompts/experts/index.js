/**
 * Experts Module Prompts Index
 * Central export point for all expert-related AI prompts
 * @module experts
 * @version 1.0.0
 */

export * from './expertDetail';
export * from './matchingEngine';

export const EXPERTS_PROMPTS_CONFIG = {
  module: 'experts',
  version: '1.0.0',
  promptCount: 2,
  prompts: [
    'expertDetail',
    'matchingEngine'
  ]
};
