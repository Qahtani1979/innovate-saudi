/**
 * Matchmaker Module AI Prompts Index
 * @version 1.0.0
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
  }
};

export default MATCHMAKER_PROMPTS;
