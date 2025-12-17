/**
 * Scaling Module Prompts Index
 * Central export for all scaling-related AI prompts
 */

export { SCALING_READINESS_PROMPTS } from './scalingReadiness';
export { ROLLOUT_RISK_PROMPTS } from './rolloutRisk';
export { COST_BENEFIT_PROMPTS } from './costBenefit';
export { SCALING_INSIGHTS_PROMPTS } from './scalingInsights';

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
  }
};
