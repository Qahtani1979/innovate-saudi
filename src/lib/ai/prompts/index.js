/**
 * AI Prompts Index
 * Central export point for all AI prompt modules
 * @version 1.0.2
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

// Media prompts
export * from './media';

// Workflows prompts
export * from './workflows';

// Onboarding prompts
export * from './onboarding';

// Taxonomy prompts
export * from './taxonomy';

// MII prompts
export * from './mii';

// Executive prompts
export * from './executive';

// Partnerships prompts
export * from './partnerships';

// Geography prompts
export * from './geography';

// Bonus prompts
export * from './bonus';

// Smart prompts
export * from './smart';

// Data analytics prompts
export * from './data';

// Gates prompts
export * from './gates';

// Approval prompts
export * from './approval';

// Content prompts
export * from './content';

// Uploader prompts
export * from './uploader';

// Communications prompts
export * from './communications';

// Solutions prompts
export * from './solutions';

// Evaluation prompts
export * from './evaluation';

// Hub prompts
export * from './hub';

// Work prompts
export * from './work';

// Feedback prompts
export * from './feedback';

// Translation prompts
export * from './translation';

// Policy prompts
export * from './policy';

// Organizations prompts
export * from './organizations';

// Knowledge prompts
export * from './knowledge';

// Admin prompts
export * from './admin';

// Reports prompts
export * from './reports';

// Procurement prompts
export * from './procurement';

// Surveys prompts
export * from './surveys';

// Notifications prompts
export * from './notifications';

// Training prompts
export * from './training';

// Benchmarks prompts
export * from './benchmarks';

// Compliance prompts
export * from './compliance';

// Resources prompts
export * from './resources';

// Timeline prompts
export * from './timeline';

// Collaboration prompts
export * from './collaboration';

// Impact prompts
export * from './impact';

// Forecasting prompts
export * from './forecasting';

// Quality prompts
export * from './quality';

// Decisions prompts
export * from './decisions';

// Learning prompts
export * from './learning';

// Automation prompts
export * from './automation';

// Integration prompts
export * from './integration';

// Visualization prompts
export * from './visualization';

// Security prompts
export * from './security';

// Performance prompts
export * from './performance';

// Documents prompts
export * from './documents';

// Meetings prompts
export * from './meetings';

// Change management prompts
export * from './change';

// Search prompts
export * from './search';

// UX prompts
export * from './ux';

// Validation prompts
export * from './validation';

// Scheduling prompts
export * from './scheduling';

// Localization prompts
export * from './localization';

// Accessibility prompts
export * from './accessibility';

// Governance prompts
export * from './governance';

// Alerts prompts
export * from './alerts';

// Linking prompts
export * from './linking';

// Summarization prompts
export * from './summarization';

// Templates prompts
export * from './templates';

// Recommendations prompts
export * from './recommendations';

// Extraction prompts
export * from './extraction';

// Comparison prompts
export * from './comparison';

// Generation prompts
export * from './generation';

// Classification prompts
export * from './classification';

// Finance prompts
export * from './finance';

// Startup prompts
export * from './startup';

/**
 * Prompt module status tracking
 * Updated as modules are implemented
 */
export const PROMPT_MODULE_STATUS = {
  strategyWizard: { status: 'complete', promptCount: 24 },
  strategyModule: { status: 'complete', promptCount: 12 },
  portfolio: { status: 'complete', promptCount: 3 },
  events: { status: 'complete', promptCount: 3 },
  challenges: { status: 'complete', promptCount: 11 },
  pilots: { status: 'complete', promptCount: 18 },
  matchmaker: { status: 'complete', promptCount: 11 },
  sandbox: { status: 'complete', promptCount: 10 },
  rd: { status: 'complete', promptCount: 11 },
  scaling: { status: 'complete', promptCount: 7 },
  solution: { status: 'complete', promptCount: 9 },
  citizen: { status: 'complete', promptCount: 10 },
  livinglab: { status: 'complete', promptCount: 5 },
  profiles: { status: 'complete', promptCount: 3 },
  programs: { status: 'complete', promptCount: 10 },
  core: { status: 'complete', promptCount: 12 },
  taxonomy: { status: 'complete', promptCount: 2 },
  mii: { status: 'complete', promptCount: 2 },
  executive: { status: 'complete', promptCount: 3 },
  partnerships: { status: 'complete', promptCount: 3 },
  geography: { status: 'complete', promptCount: 1 },
  bonus: { status: 'complete', promptCount: 1 },
  smart: { status: 'complete', promptCount: 1 },
  data: { status: 'complete', promptCount: 2 },
  gates: { status: 'complete', promptCount: 3 },
  approval: { status: 'complete', promptCount: 2 },
  content: { status: 'complete', promptCount: 1 },
  uploader: { status: 'complete', promptCount: 1 },
  communications: { status: 'complete', promptCount: 9 },
  media: { status: 'complete', promptCount: 1 },
  workflows: { status: 'complete', promptCount: 1 },
  onboarding: { status: 'complete', promptCount: 1 },
  solutions: { status: 'complete', promptCount: 3 },
  evaluation: { status: 'complete', promptCount: 2 },
  hub: { status: 'complete', promptCount: 2 },
  work: { status: 'complete', promptCount: 1 },
  feedback: { status: 'complete', promptCount: 1 },
  translation: { status: 'complete', promptCount: 2 },
  policy: { status: 'complete', promptCount: 1 },
  organizations: { status: 'complete', promptCount: 2 },
  knowledge: { status: 'complete', promptCount: 1 },
  admin: { status: 'complete', promptCount: 1 },
  reports: { status: 'complete', promptCount: 2 },
  procurement: { status: 'complete', promptCount: 2 },
  surveys: { status: 'complete', promptCount: 2 },
  notifications: { status: 'complete', promptCount: 2 },
  training: { status: 'complete', promptCount: 2 },
  benchmarks: { status: 'complete', promptCount: 3 },
  compliance: { status: 'complete', promptCount: 3 },
  resources: { status: 'complete', promptCount: 3 },
  timeline: { status: 'complete', promptCount: 3 },
  collaboration: { status: 'complete', promptCount: 3 },
  impact: { status: 'complete', promptCount: 3 },
  forecasting: { status: 'complete', promptCount: 3 },
  quality: { status: 'complete', promptCount: 3 },
  decisions: { status: 'complete', promptCount: 3 },
  learning: { status: 'complete', promptCount: 3 },
  automation: { status: 'complete', promptCount: 3 },
  integration: { status: 'complete', promptCount: 3 },
  visualization: { status: 'complete', promptCount: 3 },
  security: { status: 'complete', promptCount: 3 },
  performance: { status: 'complete', promptCount: 3 },
  documents: { status: 'complete', promptCount: 3 },
  meetings: { status: 'complete', promptCount: 3 },
  change: { status: 'complete', promptCount: 3 },
  search: { status: 'complete', promptCount: 3 },
  ux: { status: 'complete', promptCount: 3 },
  validation: { status: 'complete', promptCount: 3 },
  scheduling: { status: 'complete', promptCount: 3 },
  localization: { status: 'complete', promptCount: 3 },
  accessibility: { status: 'complete', promptCount: 3 },
  governance: { status: 'complete', promptCount: 3 },
  alerts: { status: 'complete', promptCount: 3 },
  linking: { status: 'complete', promptCount: 3 },
  summarization: { status: 'complete', promptCount: 3 },
  templates: { status: 'complete', promptCount: 3 },
  recommendations: { status: 'complete', promptCount: 5 },
  extraction: { status: 'complete', promptCount: 3 },
  comparison: { status: 'complete', promptCount: 3 },
  generation: { status: 'complete', promptCount: 3 },
  classification: { status: 'complete', promptCount: 3 },
  finance: { status: 'complete', promptCount: 1 },
  startup: { status: 'complete', promptCount: 1 }
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
  const promptsTotal = 322; // Final target

  return {
    modulesComplete: completed,
    modulesTotal: total,
    moduleProgress: Math.round((completed / total) * 100),
    promptsComplete,
    promptsTotal,
    promptProgress: Math.round((promptsComplete / promptsTotal) * 100)
  };
}

/**
 * Get all available prompts grouped by category
 */
export function getAllPromptsByCategory() {
  return PROMPT_MODULE_STATUS;
}

/**
 * Quick prompt lookup by module and type
 */
export function getPromptInfo(moduleName) {
  return PROMPT_MODULE_STATUS[moduleName] || null;
}
