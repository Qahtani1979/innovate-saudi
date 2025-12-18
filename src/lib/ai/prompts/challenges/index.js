/**
 * Challenges Module AI Prompts Index
 * @version 1.2.0
 */

// Challenge Intake
export { getChallengeIntakePrompt, challengeIntakeSchema } from './challengeIntake';

// Causal Graph
export { getCausalGraphPrompt, causalGraphSchema } from './causalGraph';

// Impact Forecaster
export { getImpactForecasterPrompt, impactForecasterSchema } from './impactForecaster';

// Innovation Framing
export { 
  getInnovationFramingPrompt, 
  innovationFramingSchema,
  getTranslationPrompt,
  translationSchema 
} from './innovationFraming';

// Treatment Plan
export { getTreatmentPlanPrompt, treatmentPlanSchema } from './treatmentPlan';

// RFP Generator
export { 
  buildRFPGeneratorPrompt, 
  rfpGeneratorSchema, 
  RFP_GENERATOR_SYSTEM_PROMPT 
} from './rfpGenerator';

// Challenge Clustering
export { 
  buildClusteringPrompt, 
  clusteringSchema, 
  CLUSTERING_SYSTEM_PROMPT 
} from './clustering';

// Cross-City Learning
export { 
  buildCrossCityLearningPrompt, 
  crossCityLearningSchema, 
  CROSS_CITY_LEARNING_SYSTEM_PROMPT 
} from './crossCityLearning';

// Challenge to R&D & Root Cause Analysis
export {
  CHALLENGE_TO_RD_SYSTEM_PROMPT, buildChallengeToRDPrompt, CHALLENGE_TO_RD_SCHEMA,
  ROOT_CAUSE_SYSTEM_PROMPT, buildRootCausePrompt, ROOT_CAUSE_SCHEMA,
  CHALLENGE_CLUSTER_SYSTEM_PROMPT, buildChallengeClusterPrompt, CHALLENGE_CLUSTER_SCHEMA
} from './challengeRD';

// Submission Brief
export {
  SUBMISSION_BRIEF_SYSTEM_PROMPT, createSubmissionBriefPrompt, SUBMISSION_BRIEF_SCHEMA
} from './submissionBrief';

// Challenge to R&D Wizard
export {
  CHALLENGE_TO_RD_PROMPTS,
  buildRDScopePrompt,
  RD_SCOPE_SCHEMA,
  buildRDProposalPrompt,
  RD_PROPOSAL_SCHEMA
} from './challengeToRD';

// Impact Report Generator
export {
  IMPACT_REPORT_SYSTEM_PROMPT,
  buildImpactReportPrompt,
  IMPACT_REPORT_SCHEMA,
  IMPACT_REPORT_PROMPTS
} from './impactReport';

// Strategic Alignment Validator
export {
  STRATEGIC_ALIGNMENT_SYSTEM_PROMPT,
  buildStrategicAlignmentPrompt,
  STRATEGIC_ALIGNMENT_SCHEMA,
  STRATEGIC_ALIGNMENT_PROMPTS
} from './strategicAlignment';

/**
 * Challenges module prompt configuration
 */
export const CHALLENGES_PROMPTS = {
  intake: {
    promptFn: 'getChallengeIntakePrompt',
    schema: 'challengeIntakeSchema',
    description: 'Analyzes challenge descriptions and extracts structured data'
  },
  causalGraph: {
    promptFn: 'getCausalGraphPrompt',
    schema: 'causalGraphSchema',
    description: 'Builds causal relationship graph for root causes'
  },
  impactForecaster: {
    promptFn: 'getImpactForecasterPrompt',
    schema: 'impactForecasterSchema',
    description: 'Forecasts impact metrics if challenge resolved'
  },
  innovationFraming: {
    promptFn: 'getInnovationFramingPrompt',
    schema: 'innovationFramingSchema',
    description: 'Transforms problems into innovation opportunities'
  },
  treatmentPlan: {
    promptFn: 'getTreatmentPlanPrompt',
    schema: 'treatmentPlanSchema',
    description: 'Generates comprehensive treatment plans'
  },
  rfpGenerator: {
    promptFn: 'buildRFPGeneratorPrompt',
    schema: 'rfpGeneratorSchema',
    description: 'Generates professional RFPs for challenges'
  },
  clustering: {
    promptFn: 'buildClusteringPrompt',
    schema: 'clusteringSchema',
    description: 'Groups similar challenges into clusters'
  },
  crossCityLearning: {
    promptFn: 'buildCrossCityLearningPrompt',
    schema: 'crossCityLearningSchema',
    description: 'Finds similar resolved challenges from other cities'
  },
  challengeToRD: {
    promptFn: 'buildChallengeToRDPrompt',
    schema: 'CHALLENGE_TO_RD_SCHEMA',
    description: 'Generates R&D calls from challenges'
  },
  rootCause: {
    promptFn: 'buildRootCausePrompt',
    schema: 'ROOT_CAUSE_SCHEMA',
    description: 'Deep root cause analysis with 5 Whys'
  },
  challengeCluster: {
    promptFn: 'buildChallengeClusterPrompt',
    schema: 'CHALLENGE_CLUSTER_SCHEMA',
    description: 'Identifies challenge clusters and patterns'
  }
};

export default CHALLENGES_PROMPTS;
