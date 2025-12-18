/**
 * AI Prompt Library - Main Export
 * Provides unified access to all AI prompts and utilities
 * @module lib/ai
 */

// Prompt Library
export * from './prompts';

// Prompt Builder Utilities
export * from './promptBuilder';

// Prompt Registry
export * from './promptRegistry';

// Re-export commonly used items at top level
export { 
  buildPrompt, 
  buildPromptWithSaudiContext, 
  combinePrompts,
  buildBilingualPrompt,
  validatePromptContext 
} from './promptBuilder';

export {
  getPromptCategories,
  getPromptCategory,
  searchPrompts,
  getPromptStats,
  promptModuleExists,
  getRecommendedPrompts
} from './promptRegistry';

/**
 * Quick access to prompt statistics
 */
export function getAILibraryStatus() {
  const { getImplementationProgress } = require('./prompts');
  const progress = getImplementationProgress();
  
  return {
    version: '2.0.0',
    status: 'production',
    ...progress,
    features: [
      'Centralized prompt management',
      'Saudi Arabia context integration',
      'Bilingual support (EN/AR)',
      'Schema validation',
      'Rate limit handling',
      'Prompt discovery and search'
    ]
  };
}
