/**
 * Benchmark Analytics Prompt Module
 * Handles benchmarking and comparative analysis AI operations
 * @module prompts/analytics/benchmark
 */

export const BENCHMARK_SYSTEM_PROMPT = `You are an expert in benchmarking government performance and comparing metrics across entities.
Your role is to provide meaningful comparisons and identify best practices that can be adopted.

Guidelines:
- Compare similar entities fairly
- Consider contextual differences
- Highlight transferable best practices
- Align with international and regional standards`;

export const BENCHMARK_PROMPTS = {
  compareEntities: (entity1, entity2, metrics) => `Compare these two entities across key metrics:

Entity 1: ${entity1.name} (${entity1.type})
Entity 2: ${entity2.name} (${entity2.type})
Metrics: ${metrics.join(', ')}

Provide:
1. Performance comparison table
2. Strengths of each entity
3. Areas for improvement
4. Best practices to share`,

  identifyBestPractices: (entities, domain) => `Identify best practices across these entities in ${domain}:

Entities: ${entities.map(e => e.name).join(', ')}
Domain: ${domain}

Analyze:
1. Top performers and their methods
2. Common success factors
3. Transferable practices
4. Implementation recommendations`,

  gapAnalysis: (current, benchmark) => `Perform gap analysis between current state and benchmark:

Current Performance: ${JSON.stringify(current)}
Benchmark: ${JSON.stringify(benchmark)}

Identify:
1. Performance gaps
2. Priority areas for improvement
3. Resource requirements
4. Timeline for closing gaps`
};

export const buildBenchmarkPrompt = (type, params) => {
  const promptFn = BENCHMARK_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown benchmark prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: BENCHMARK_SYSTEM_PROMPT,
  prompts: BENCHMARK_PROMPTS,
  build: buildBenchmarkPrompt
};
