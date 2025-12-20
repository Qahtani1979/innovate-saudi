/**
 * Matchmaker Module AI Prompts Index
 * @version 1.3.0
 */

// Match Success Predictor
export { getMatchSuccessPredictorPrompt, matchSuccessPredictorSchema } from './matchSuccessPredictor';

// Enhanced Matching Engine
export { getEnhancedMatchingPrompt, enhancedMatchingSchema } from './enhancedMatching';

// Failed Match Learning
export { getFailedMatchLearningPrompt, failedMatchLearningSchema } from './failedMatchLearning';

// Strategic Challenge Mapper
export { getStrategicChallengeMapperPrompt, strategicChallengeMapperSchema } from './strategicChallengeMapper';

// Multi-Party Matchmaker
export { getMultiPartyMatchmakerPrompt, multiPartyMatchmakerSchema } from './multiPartyMatchmaker';

// Provider Performance Scorecard
export { 
  PROVIDER_PERFORMANCE_SYSTEM_PROMPT, 
  buildProviderPerformancePrompt, 
  PROVIDER_PERFORMANCE_SCHEMA 
} from './providerPerformance';

// Match Notification & Deal Flow
export {
  MATCH_NOTIFIER_SYSTEM_PROMPT, buildMatchNotifierPrompt, MATCH_NOTIFIER_SCHEMA,
  DEAL_FLOW_SYSTEM_PROMPT, buildDealFlowPrompt, DEAL_FLOW_SCHEMA,
  PROVIDER_RANKING_SYSTEM_PROMPT, buildProviderRankingPrompt, PROVIDER_RANKING_SCHEMA
} from './matchNotifier';

// Executive Review Gate
export {
  EXECUTIVE_REVIEW_SYSTEM_PROMPT,
  buildExecutiveBriefPrompt,
  EXECUTIVE_BRIEF_SCHEMA,
  buildBatchReviewPrompt,
  BATCH_REVIEW_SCHEMA,
  EXECUTIVE_REVIEW_PROMPTS
} from './executiveReview';

// Solution Matcher
export {
  SOLUTION_MATCHER_SYSTEM_PROMPT,
  buildSolutionMatcherPrompt,
  SOLUTION_MATCHER_SCHEMA,
  SOLUTION_MATCHER_PROMPTS
} from './solutionMatcher';

// Quality Gate
export {
  QUALITY_GATE_SYSTEM_PROMPT,
  buildQualityGatePrompt,
  QUALITY_GATE_SCHEMA
} from './qualityGate';

// Application Profile Enhancement
export {
  MATCHMAKER_PROFILE_ENHANCE_PROMPT,
  MATCHMAKER_PROFILE_ENHANCE_PROMPT_TEMPLATE
} from './application';

// Negotiation Assistance
export {
  NEGOTIATION_SYSTEM_PROMPT,
  buildNegotiationPrompt,
  NEGOTIATION_SCHEMA,
  NEGOTIATION_PROMPTS
} from './negotiation';

// Consortium Builder
export {
  CONSORTIUM_SYSTEM_PROMPT,
  buildConsortiumPrompt,
  CONSORTIUM_SCHEMA,
  CONSORTIUM_PROMPTS
} from './consortium';

// Portfolio Analysis
export {
  PORTFOLIO_ANALYSIS_SYSTEM_PROMPT,
  buildPortfolioAnalysisPrompt,
  PORTFOLIO_ANALYSIS_SCHEMA,
  PORTFOLIO_ANALYSIS_PROMPTS
} from './portfolioAnalysis';

// Portfolio Intelligence
export {
  PORTFOLIO_INTELLIGENCE_SYSTEM_PROMPT,
  buildPortfolioIntelligencePrompt,
  PORTFOLIO_INTELLIGENCE_SCHEMA,
  PORTFOLIO_INTELLIGENCE_PROMPTS
} from './portfolioIntelligence';

// Engagement Hub
export * from './engagementHub';

// Engagement Quality
export * from './engagementQuality';

// Match Optimization
export * from './matchOptimization';

/**
 * Matchmaker module prompt configuration
 */
export const MATCHMAKER_PROMPTS = {
  matchSuccessPredictor: {
    promptFn: 'getMatchSuccessPredictorPrompt',
    schema: 'matchSuccessPredictorSchema',
    description: 'Predicts match success probability'
  },
  enhancedMatching: {
    promptFn: 'getEnhancedMatchingPrompt',
    schema: 'enhancedMatchingSchema',
    description: 'Bilateral matching engine'
  },
  failedMatchLearning: {
    promptFn: 'getFailedMatchLearningPrompt',
    schema: 'failedMatchLearningSchema',
    description: 'Learns from failed matches'
  },
  strategicChallengeMapper: {
    promptFn: 'getStrategicChallengeMapperPrompt',
    schema: 'strategicChallengeMapperSchema',
    description: 'Maps to strategic challenges'
  },
  multiPartyMatchmaker: {
    promptFn: 'getMultiPartyMatchmakerPrompt',
    schema: 'multiPartyMatchmakerSchema',
    description: 'Forms optimal consortiums'
  },
  matchNotifier: {
    promptFn: 'buildMatchNotifierPrompt',
    schema: 'MATCH_NOTIFIER_SCHEMA',
    description: 'Generates personalized match notifications'
  },
  dealFlow: {
    promptFn: 'buildDealFlowPrompt',
    schema: 'DEAL_FLOW_SCHEMA',
    description: 'Analyzes and predicts deal flow'
  },
  providerRanking: {
    promptFn: 'buildProviderRankingPrompt',
    schema: 'PROVIDER_RANKING_SCHEMA',
    description: 'Ranks providers for challenges'
  },
  executiveReview: {
    promptFn: 'buildExecutiveBriefPrompt',
    schema: 'EXECUTIVE_BRIEF_SCHEMA',
    description: 'Generates executive briefings for applications'
  },
  solutionMatcher: {
    promptFn: 'buildSolutionMatcherPrompt',
    schema: 'SOLUTION_MATCHER_SCHEMA',
    description: 'Matches challenges with solutions'
  },
  qualityGate: {
    promptFn: 'buildQualityGatePrompt',
    schema: 'QUALITY_GATE_SCHEMA',
    description: 'Evaluates match quality'
  },
  application: {
    promptFn: 'MATCHMAKER_PROFILE_ENHANCE_PROMPT_TEMPLATE',
    schema: 'MATCHMAKER_PROFILE_ENHANCE_PROMPT.schema',
    description: 'Enhances application profiles'
  },
  negotiation: {
    promptFn: 'buildNegotiationPrompt',
    schema: 'NEGOTIATION_SCHEMA',
    description: 'Assists with match negotiations'
  },
  consortium: {
    promptFn: 'buildConsortiumPrompt',
    schema: 'CONSORTIUM_SCHEMA',
    description: 'Builds optimal provider consortiums'
  },
  portfolioAnalysis: {
    promptFn: 'buildPortfolioAnalysisPrompt',
    schema: 'PORTFOLIO_ANALYSIS_SCHEMA',
    description: 'Analyzes provider portfolios'
  },
  portfolioIntelligence: {
    promptFn: 'buildPortfolioIntelligencePrompt',
    schema: 'PORTFOLIO_INTELLIGENCE_SCHEMA',
    description: 'Provider portfolio intelligence'
  }
};

export default MATCHMAKER_PROMPTS;
