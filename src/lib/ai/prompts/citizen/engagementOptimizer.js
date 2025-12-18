/**
 * Citizen Engagement Optimizer Prompt Module
 * Handles citizen engagement optimization AI operations
 * @module prompts/citizen/engagementOptimizer
 */

export const ENGAGEMENT_OPTIMIZER_SYSTEM_PROMPT = `You are an expert in citizen engagement for government initiatives.
Your role is to optimize engagement strategies and increase participation.

Guidelines:
- Consider diverse citizen segments
- Support accessibility requirements
- Respect privacy and consent
- Promote inclusive participation`;

export const ENGAGEMENT_OPTIMIZER_PROMPTS = {
  analyzeEngagement: (data) => `Analyze citizen engagement patterns:

Engagement Data: ${JSON.stringify(data)}
Period: ${data.period || 'Last 30 days'}
Channels: ${data.channels?.join(', ') || 'Multiple'}

Provide:
1. Engagement metrics summary
2. Segment performance
3. Channel effectiveness
4. Drop-off analysis
5. Optimization opportunities`,

  optimizeStrategy: (current, goals) => `Optimize engagement strategy:

Current Strategy: ${JSON.stringify(current)}
Goals: ${goals.join(', ')}
Target Segments: ${current.segments?.join(', ') || 'All citizens'}

Recommend:
1. Channel optimization
2. Content improvements
3. Timing adjustments
4. Personalization strategies
5. Gamification opportunities
6. Expected improvements`,

  segmentCitizens: (population, criteria) => `Segment citizen population:

Population Size: ${population.size || 'Unknown'}
Available Data: ${criteria.join(', ')}
Purpose: ${population.purpose || 'General engagement'}

Create:
1. Segment definitions
2. Segment sizes
3. Key characteristics
4. Engagement preferences
5. Targeted approaches`
};

export const buildEngagementOptimizerPrompt = (type, params) => {
  const promptFn = ENGAGEMENT_OPTIMIZER_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown engagement optimizer prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: ENGAGEMENT_OPTIMIZER_SYSTEM_PROMPT,
  prompts: ENGAGEMENT_OPTIMIZER_PROMPTS,
  build: buildEngagementOptimizerPrompt
};
