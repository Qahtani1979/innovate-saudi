/**
 * Comparison Prompts - Entity and data comparison
 * @module prompts/comparison
 */

export const comparisonPrompts = {
  entityComparison: {
    id: 'comparison_entity',
    name: 'Entity Comparison',
    description: 'Compare two or more entities',
    prompt: (context) => `
Compare these entities and provide analysis.

ENTITIES TO COMPARE:
${context.entities.map((e, i) => `Entity ${i + 1}: ${JSON.stringify(e, null, 2)}`).join('\n\n')}

COMPARISON CRITERIA:
${context.criteria?.join(', ') || 'all available attributes'}

Provide:
1. Side-by-side comparison matrix
2. Key similarities
3. Key differences
4. Strengths of each
5. Recommendation based on context

Return comprehensive comparison.
`,
    schema: {
      comparison_matrix: 'object',
      similarities: 'array',
      differences: 'array',
      entity_strengths: 'object',
      recommendation: 'object'
    }
  },

  versionComparison: {
    id: 'comparison_version',
    name: 'Version Comparison',
    description: 'Compare different versions of a document or plan',
    prompt: (context) => `
Compare these versions and identify changes.

VERSION 1 (${context.version1.label || 'Previous'}):
${JSON.stringify(context.version1.data, null, 2)}

VERSION 2 (${context.version2.label || 'Current'}):
${JSON.stringify(context.version2.data, null, 2)}

Identify:
1. Added elements
2. Removed elements
3. Modified elements with before/after
4. Impact assessment of changes
5. Change summary

Return detailed version comparison.
`,
    schema: {
      additions: 'array',
      removals: 'array',
      modifications: 'array',
      impact_assessment: 'object',
      change_summary: 'string'
    }
  },

  benchmarkComparison: {
    id: 'comparison_benchmark',
    name: 'Benchmark Comparison',
    description: 'Compare against benchmarks or standards',
    prompt: (context) => `
Compare performance against benchmarks.

CURRENT PERFORMANCE:
${JSON.stringify(context.performance, null, 2)}

BENCHMARKS:
${JSON.stringify(context.benchmarks, null, 2)}

CONTEXT: ${context.industry || 'Saudi Arabia government sector'}

Analyze:
1. Performance vs each benchmark
2. Gap analysis
3. Percentile ranking
4. Areas exceeding benchmarks
5. Improvement priorities

Return benchmark analysis.
`,
    schema: {
      benchmark_gaps: 'array',
      percentile_rankings: 'object',
      exceeding_areas: 'array',
      improvement_priorities: 'array',
      overall_assessment: 'object'
    }
  }
};

export const getComparisonPrompt = (type, context) => {
  const prompt = comparisonPrompts[type];
  if (!prompt) throw new Error(`Unknown comparison prompt: ${type}`);
  return {
    prompt: prompt.prompt(context),
    schema: prompt.schema
  };
};
