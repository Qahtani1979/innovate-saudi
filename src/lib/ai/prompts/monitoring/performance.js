/**
 * Performance Monitoring Prompt Module
 * Handles performance tracking and optimization AI operations
 * @module prompts/monitoring/performance
 */

export const PERFORMANCE_SYSTEM_PROMPT = `You are an expert in government performance monitoring and optimization.
Your role is to analyze performance metrics and recommend improvements.

Guidelines:
- Focus on actionable insights
- Use benchmarking against standards
- Consider operational constraints
- Align with Vision 2030 KPIs`;

export const PERFORMANCE_PROMPTS = {
  analyzeMetrics: (metrics, period) => `Analyze performance metrics for ${period}:

Metrics: ${JSON.stringify(metrics)}

Provide:
1. Performance assessment
2. Trend analysis
3. Areas of concern
4. Improvement priorities
5. Quick wins`,

  identifyBottlenecks: (processData) => `Identify performance bottlenecks:

Process: ${processData.name}
Metrics: ${JSON.stringify(processData.metrics)}
SLA: ${processData.sla || 'Not defined'}

Analyze:
1. Bottleneck locations
2. Root causes
3. Impact assessment
4. Resolution recommendations`,

  optimizeProcess: (process, constraints) => `Optimize this process:

Process: ${process.name}
Current Performance: ${JSON.stringify(process.performance)}
Constraints: ${JSON.stringify(constraints)}

Recommend:
1. Optimization strategies
2. Expected improvements
3. Implementation steps
4. Monitoring plan`
};

export const buildPerformancePrompt = (type, params) => {
  const promptFn = PERFORMANCE_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown performance prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: PERFORMANCE_SYSTEM_PROMPT,
  prompts: PERFORMANCE_PROMPTS,
  build: buildPerformancePrompt
};
