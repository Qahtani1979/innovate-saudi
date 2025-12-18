/**
 * Scaling Module Prompts Index
 * Central export for all scaling-related AI prompts
 * @version 1.2.0
 */

export { SCALING_READINESS_PROMPTS } from './scalingReadiness';
export { ROLLOUT_RISK_PROMPTS } from './rolloutRisk';
export { COST_BENEFIT_PROMPTS } from './costBenefit';
export { SCALING_INSIGHTS_PROMPTS } from './scalingInsights';
export {
  ADAPTIVE_ROLLOUT_SYSTEM_PROMPT,
  createAdaptiveRolloutPrompt,
  ADAPTIVE_ROLLOUT_SCHEMA
} from './adaptiveRollout';

// Readiness Checker Prompts
export {
  SCALING_READINESS_SYSTEM_PROMPT,
  buildScalingReadinessPrompt,
  SCALING_READINESS_SCHEMA,
  buildScalingStrategyPrompt,
  SCALING_STRATEGY_SCHEMA
} from './readiness';

// Planning Wizard
export {
  SCALING_PLANNING_SYSTEM_PROMPT,
  buildScalingEstimatesPrompt,
  SCALING_ESTIMATES_SCHEMA,
  SCALING_PLANNING_PROMPTS
} from './planningWizard';

export const SCALING_PROMPT_MANIFEST = {
  scalingReadiness: {
    file: 'scalingReadiness.js',
    purpose: 'Predict municipal readiness for scaling',
    component: 'AIScalingReadinessPredictor'
  },
  rolloutRisk: {
    file: 'rolloutRisk.js',
    purpose: 'Predict rollout risks for scaling',
    component: 'RolloutRiskPredictor'
  },
  costBenefit: {
    file: 'costBenefit.js',
    purpose: 'Analyze cost-benefit of scaling',
    component: 'ScalingCostBenefitAnalyzer'
  },
  scalingInsights: {
    file: 'scalingInsights.js',
    purpose: 'Generate national scaling insights',
    component: 'ScalingListAIInsights'
  },
  adaptiveRollout: {
    file: 'adaptiveRollout.js',
    purpose: 'Optimize rollout sequence adaptively',
    component: 'AdaptiveRolloutSequencing'
  },
  readinessChecker: {
    file: 'readiness.js',
    purpose: 'Check and improve pilot scaling readiness',
    component: 'ScalingReadinessChecker'
  }
};
