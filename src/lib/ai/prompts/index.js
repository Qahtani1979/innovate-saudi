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

// Pilot prompts  
// export * from './pilot';

// Matchmaker prompts
// export * from './matchmaker';

// Sandbox prompts
// export * from './sandbox';

// R&D prompts
// export * from './rd';

// Challenge prompts
// export * from './challenge';

// Solution prompts
// export * from './solution';

// Scaling prompts
// export * from './scaling';

// Citizen prompts
// export * from './citizen';

// Living Lab prompts
// export * from './livinglab';

// Profiles prompts
// export * from './profiles';

// Programs prompts
// export * from './programs';

// Smart prompts
// export * from './smart';

/**
 * Prompt module status tracking
 * Updated as modules are implemented
 */
export const PROMPT_MODULE_STATUS = {
  strategy: { status: 'complete', promptCount: 24 },
  portfolio: { status: 'complete', promptCount: 3 },
  events: { status: 'complete', promptCount: 3 },
  pilot: { status: 'pending', promptCount: 0 },
  matchmaker: { status: 'pending', promptCount: 0 },
  sandbox: { status: 'pending', promptCount: 0 },
  rd: { status: 'pending', promptCount: 0 },
  challenge: { status: 'pending', promptCount: 0 },
  solution: { status: 'pending', promptCount: 0 },
  scaling: { status: 'pending', promptCount: 0 },
  citizen: { status: 'pending', promptCount: 0 },
  livinglab: { status: 'pending', promptCount: 0 },
  profiles: { status: 'pending', promptCount: 0 },
  programs: { status: 'pending', promptCount: 0 },
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
