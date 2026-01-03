/**
 * Portfolio Module AI Prompts Index
 * @version 1.1.0
 */

// Portfolio Health Monitor
export { getPortfolioHealthPrompt, portfolioHealthSchema } from './portfolioHealth';

// Portfolio Optimizer
export { getPortfolioOptimizerPrompt, portfolioOptimizerSchema } from './portfolioOptimizer';

// Collaboration Suggester
export { getCollaborationSuggesterPrompt, collaborationSuggesterSchema } from './collaborationSuggester';

// Report AI (NEW)
export {
  REPORT_GENERATION_SYSTEM_PROMPT,
  buildCustomReportPrompt,
  CUSTOM_REPORT_SCHEMA,
  buildPortfolioPredictivePrompt,
  PREDICTIVE_ANALYTICS_SCHEMA,
  buildAnomalyDetectionPrompt,
  ANOMALY_DETECTION_SCHEMA
} from './reportAI';

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
  },
  customReport: {
    promptFn: 'buildCustomReportPrompt',
    schema: 'CUSTOM_REPORT_SCHEMA',
    description: 'Generates AI-powered custom reports with insights'
  },
  predictive: {
    promptFn: 'buildPortfolioPredictivePrompt',
    schema: 'PREDICTIVE_ANALYTICS_SCHEMA',
    description: 'Provides predictive analytics for portfolio performance'
  },
  anomalyDetection: {
    promptFn: 'buildAnomalyDetectionPrompt',
    schema: 'ANOMALY_DETECTION_SCHEMA',
    description: 'Detects anomalies in portfolio metrics'
  }
};

export default PORTFOLIO_PROMPTS;
