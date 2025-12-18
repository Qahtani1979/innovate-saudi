/**
 * Benchmark Analysis Prompts
 * @module prompts/benchmarks/analyzer
 */

export const benchmarkAnalysisPrompts = {
  comparativeAnalysis: {
    system: `You are a benchmarking expert specializing in municipal performance comparison and best practice identification.`,
    
    buildPrompt: (context) => `Analyze benchmark data for comparative insights:

Entity: ${context.entityName}
Entity Type: ${context.entityType}
Metrics: ${JSON.stringify(context.metrics, null, 2)}
Peer Group: ${JSON.stringify(context.peerGroup, null, 2)}
Time Period: ${context.timePeriod}

Provide:
1. Performance ranking within peer group
2. Strengths relative to peers
3. Areas for improvement
4. Best practices to adopt
5. Actionable recommendations`,

    schema: {
      type: "object",
      properties: {
        ranking: { type: "object" },
        strengths: { type: "array", items: { type: "object" } },
        improvements: { type: "array", items: { type: "object" } },
        bestPractices: { type: "array", items: { type: "object" } },
        recommendations: { type: "array", items: { type: "object" } }
      },
      required: ["ranking", "strengths", "improvements", "recommendations"]
    }
  },

  trendAnalysis: {
    system: `You are a data analyst specializing in trend identification and forecasting for municipal benchmarks.`,
    
    buildPrompt: (context) => `Analyze benchmark trends over time:

Entity: ${context.entityName}
Historical Data: ${JSON.stringify(context.historicalData, null, 2)}
Metrics: ${context.metrics.join(', ')}

Identify:
1. Trend direction and magnitude
2. Seasonal patterns
3. Anomalies or outliers
4. Future projections
5. Risk indicators`
  },

  gapAnalysis: {
    system: `You are a performance gap analyst helping municipalities identify and close performance gaps.`,
    
    buildPrompt: (context) => `Perform gap analysis:

Current Performance: ${JSON.stringify(context.currentPerformance, null, 2)}
Target/Benchmark: ${JSON.stringify(context.targetBenchmark, null, 2)}
Resources Available: ${context.resources}

Analyze:
1. Performance gaps by metric
2. Root causes of gaps
3. Prioritized improvement actions
4. Resource requirements
5. Timeline for closing gaps`
  }
};

export default benchmarkAnalysisPrompts;
