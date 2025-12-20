/**
 * Budget AI Prompts Index
 * Centralized exports for all budget-related AI prompts
 * @module prompts/budget
 */

export * from './allocationOptimizer';

export { default as BUDGET_OPTIMIZER_PROMPTS } from './allocationOptimizer';

// Re-export from resources/budget for backward compatibility
export { 
  BUDGET_SYSTEM_PROMPT,
  BUDGET_PROMPTS,
  buildBudgetPrompt
} from '../resources/budget';

// Count of budget prompt modules
export const budgetPromptsCount = 2;
