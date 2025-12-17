/**
 * AI Prompts Index
 * Central export point for all AI prompt modules
 * @version 1.0.1
 */

// Foundation exports
export { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS, getSystemPrompt, buildPromptWithContext } from '@/lib/saudiContext';
export * from '../bilingualSchemaBuilder';

// Strategy wizard prompts (existing)
export * from '@/components/strategy/wizard/prompts';

// ============================================
// Module-specific prompts
// ============================================

// Portfolio prompts
export * from './portfolio';

// Events prompts
export * from './events';

// Challenges prompts
export * from './challenges';

// Pilots prompts
export * from './pilots';

// Matchmaker prompts
export * from './matchmaker';

// Sandbox prompts
export * from './sandbox';

// R&D prompts
export * from './rd';

// Scaling prompts
export * from './scaling';

// Solution prompts
export * from './solution';

// Citizen prompts
export * from './citizen';

// Living Lab prompts
export * from './livinglab';

// Profiles prompts
export * from './profiles';

// Programs prompts
export * from './programs';

// Core prompts (root-level components)
export * from './core';

// Strategy module prompts
export * from './strategy';

// Taxonomy prompts
export * from './taxonomy';

// MII prompts
export * from './mii';

// Smart prompts
// export * from './smart';

/**
 * Prompt module status tracking
 * Updated as modules are implemented
 */
export const PROMPT_MODULE_STATUS = {
  strategyWizard: { status: 'complete', promptCount: 24 },
  strategyModule: { status: 'complete', promptCount: 4 },
  portfolio: { status: 'complete', promptCount: 3 },
  events: { status: 'complete', promptCount: 3 },
  challenges: { status: 'complete', promptCount: 8 },
  pilots: { status: 'complete', promptCount: 4 },
  matchmaker: { status: 'complete', promptCount: 5 },
  sandbox: { status: 'complete', promptCount: 5 },
  rd: { status: 'complete', promptCount: 5 },
  scaling: { status: 'complete', promptCount: 4 },
  solution: { status: 'complete', promptCount: 9 },
  citizen: { status: 'complete', promptCount: 5 },
  livinglab: { status: 'complete', promptCount: 4 },
  profiles: { status: 'complete', promptCount: 3 },
  programs: { status: 'complete', promptCount: 4 },
  core: { status: 'complete', promptCount: 5 },
  taxonomy: { status: 'complete', promptCount: 2 },
  mii: { status: 'complete', promptCount: 2 },
  smart: { status: 'pending', promptCount: 0 }
};

/**
 * Get implementation progress
 * @returns {Object} Progress stats
 */
export function getImplementationProgress() {
  const modules = Object.entries(PROMPT_MODULE_STATUS);
  const completed = modules.filter(([, v]) => v.status === 'complete').length;
  const total = modules.length;
  const promptsComplete = modules.reduce((sum, [, v]) => sum + (v.status === 'complete' ? v.promptCount : 0), 0);
  const promptsTotal = 98; // Target from plan

  return {
    modulesComplete: completed,
    modulesTotal: total,
    moduleProgress: Math.round((completed / total) * 100),
    promptsComplete,
    promptsTotal,
    promptProgress: Math.round((promptsComplete / promptsTotal) * 100)
  };
}
