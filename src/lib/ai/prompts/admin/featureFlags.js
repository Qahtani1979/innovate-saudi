/**
 * Feature flags analysis prompts
 * @module admin/featureFlags
 */

export const FEATURE_FLAGS_SYSTEM_PROMPT = `You are an expert in feature flag management and A/B testing for software platforms.`;

export const createFeatureFlagAnalysisPrompt = (flags, usage) => `Analyze feature flag configuration and usage:

Active Flags: ${flags?.length || 0}
Usage Data: ${JSON.stringify(usage || {})}

Provide analysis:
1. Flag effectiveness assessment
2. Cleanup recommendations (stale flags)
3. A/B test insights
4. Rollout recommendations
5. Risk assessment`;

export const FEATURE_FLAG_SCHEMA = {
  type: 'object',
  properties: {
    effectiveness_score: { type: 'number' },
    stale_flags: { type: 'array', items: { type: 'string' } },
    ab_insights: { type: 'array', items: { type: 'string' } },
    rollout_recommendations: { type: 'array', items: { type: 'string' } },
    risk_assessment: { type: 'string' }
  }
};
