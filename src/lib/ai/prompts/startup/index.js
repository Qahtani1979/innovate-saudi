/**
 * Startup Prompts Index
 * @module startup
 * @version 1.1.0
 */

// Churn Predictor
export * from './churnPredictor';
export { default as CHURN_PREDICTOR_PROMPTS } from './churnPredictor';

// Mentorship Matcher
export * from './mentorshipMatcher';
export { default as MENTORSHIP_MATCHER_PROMPTS } from './mentorshipMatcher';

// Profile Enhancer
export * from './profileEnhancer';
export { default as PROFILE_ENHANCER_PROMPTS } from './profileEnhancer';

// Opportunity Scorer
export * from './opportunityScorer';
export { default as OPPORTUNITY_SCORER_PROMPTS } from './opportunityScorer';

// Collaboration Recommender
export * from './collaborationRecommender';
export { default as COLLABORATION_RECOMMENDER_PROMPTS } from './collaborationRecommender';

/**
 * Startup module prompt configuration
 */
export const STARTUP_PROMPTS = {
  churnPredictor: {
    promptFn: 'buildChurnPredictorPrompt',
    schema: 'CHURN_PREDICTOR_SCHEMA',
    description: 'Predicts startup churn risk'
  },
  mentorshipMatcher: {
    promptFn: 'buildMentorshipMatcherPrompt',
    schema: 'MENTORSHIP_MATCHER_SCHEMA',
    description: 'Matches startups with mentors'
  },
  profileEnhancer: {
    promptFn: 'buildProfileEnhancerPrompt',
    schema: 'PROFILE_ENHANCER_SCHEMA',
    description: 'Enhances startup profiles'
  },
  opportunityScorer: {
    promptFn: 'buildOpportunityScorerPrompt',
    schema: 'OPPORTUNITY_SCORER_SCHEMA',
    description: 'Scores opportunities for startups'
  },
  collaborationRecommender: {
    promptFn: 'buildCollaborationRecommenderPrompt',
    schema: 'COLLABORATION_RECOMMENDER_SCHEMA',
    description: 'Recommends collaboration partners'
  }
};

export default STARTUP_PROMPTS;
