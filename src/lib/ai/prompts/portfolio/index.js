/**
 * Portfolio Module AI Prompts Index
 * @version 1.0.0
 */

// Portfolio Health Monitor
export { getPortfolioHealthPrompt, portfolioHealthSchema } from './portfolioHealth';

// Portfolio Optimizer
export { getPortfolioOptimizerPrompt, portfolioOptimizerSchema } from './portfolioOptimizer';

// Collaboration Suggester
export { getCollaborationSuggesterPrompt, collaborationSuggesterSchema } from './collaborationSuggester';

/**
 * Portfolio module prompt configuration
 */
export const PORTFOLIO_PROMPTS = {
  health: {
    promptFn: 'getPortfolioHealthPrompt',
    schema: 'portfolioHealthSchema',
    description: 'Analyzes portfolio balance, pipeline health, and risk areas'
  },
  optimizer: {
    promptFn: 'getPortfolioOptimizerPrompt',
    schema: 'portfolioOptimizerSchema',
    description: 'Recommends pilot acceleration, pausing, or termination'
  },
  collaboration: {
    promptFn: 'getCollaborationSuggesterPrompt',
    schema: 'collaborationSuggesterSchema',
    description: 'Suggests collaboration opportunities based on entity context'
  }
};

export default PORTFOLIO_PROMPTS;
