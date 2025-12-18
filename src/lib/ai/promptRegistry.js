/**
 * Prompt Registry
 * Central registry for discovering and accessing prompts
 * @module lib/ai/promptRegistry
 */

import { PROMPT_MODULE_STATUS, getImplementationProgress } from './prompts';

/**
 * Get all available prompt categories
 * @returns {Array} List of prompt categories
 */
export function getPromptCategories() {
  return Object.keys(PROMPT_MODULE_STATUS);
}

/**
 * Get prompts for a specific category
 * @param {string} category - The category name
 * @returns {Object} Category info and status
 */
export function getPromptCategory(category) {
  return PROMPT_MODULE_STATUS[category] || null;
}

/**
 * Search prompts by keyword
 * @param {string} keyword - Search keyword
 * @returns {Array} Matching categories
 */
export function searchPrompts(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return Object.entries(PROMPT_MODULE_STATUS)
    .filter(([name]) => name.toLowerCase().includes(lowerKeyword))
    .map(([name, info]) => ({ name, ...info }));
}

/**
 * Get prompt usage statistics
 * @returns {Object} Usage statistics
 */
export function getPromptStats() {
  const progress = getImplementationProgress();
  const categories = getPromptCategories();
  
  const bySize = {
    large: categories.filter(c => PROMPT_MODULE_STATUS[c].promptCount >= 5),
    medium: categories.filter(c => PROMPT_MODULE_STATUS[c].promptCount >= 3 && PROMPT_MODULE_STATUS[c].promptCount < 5),
    small: categories.filter(c => PROMPT_MODULE_STATUS[c].promptCount < 3)
  };

  return {
    ...progress,
    categories: categories.length,
    bySize,
    topCategories: categories
      .sort((a, b) => PROMPT_MODULE_STATUS[b].promptCount - PROMPT_MODULE_STATUS[a].promptCount)
      .slice(0, 10)
      .map(name => ({ name, count: PROMPT_MODULE_STATUS[name].promptCount }))
  };
}

/**
 * Validate that a prompt module exists
 * @param {string} moduleName - Module name to check
 * @returns {boolean} Whether the module exists
 */
export function promptModuleExists(moduleName) {
  return moduleName in PROMPT_MODULE_STATUS;
}

/**
 * Get recommended prompts for a use case
 * @param {string} useCase - Description of the use case
 * @returns {Array} Recommended prompt categories
 */
export function getRecommendedPrompts(useCase) {
  const keywords = useCase.toLowerCase().split(' ');
  const matches = new Map();

  for (const category of getPromptCategories()) {
    const categoryLower = category.toLowerCase();
    let score = 0;
    
    for (const keyword of keywords) {
      if (categoryLower.includes(keyword)) score += 2;
      if (keyword.includes(categoryLower)) score += 1;
    }
    
    if (score > 0) {
      matches.set(category, score);
    }
  }

  return Array.from(matches.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, score]) => ({
      name,
      score,
      ...PROMPT_MODULE_STATUS[name]
    }));
}

export default {
  getPromptCategories,
  getPromptCategory,
  searchPrompts,
  getPromptStats,
  promptModuleExists,
  getRecommendedPrompts
};
