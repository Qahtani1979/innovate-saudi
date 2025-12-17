/**
 * Challenges Module AI Prompts Index
 * @version 1.0.0
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
  }
};

export default CHALLENGES_PROMPTS;
