/**
 * Matchmaker Module AI Prompts Index
 * @version 1.2.0
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
  }
};

export default MATCHMAKER_PROMPTS;
