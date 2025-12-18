/**
 * Learning and Insights Prompts
 * @module prompts/learning/insights
 */

export const learningInsightsPrompts = {
  lessonsLearned: {
    system: `You are a lessons learned facilitator extracting valuable insights from project experiences.`,
    
    buildPrompt: (context) => `Extract lessons learned:

Project: ${context.projectName}
Outcomes: ${JSON.stringify(context.outcomes, null, 2)}
Challenges Faced: ${context.challenges.join(', ')}
Successes: ${context.successes.join(', ')}
Team Feedback: ${context.teamFeedback}

Identify:
1. Key lessons by category
2. Success factors
3. Failure points
4. Transferable insights
5. Recommendations for future projects`,

    schema: {
      type: "object",
      properties: {
        lessons: { type: "array", items: { type: "object" } },
        successFactors: { type: "array", items: { type: "string" } },
        failurePoints: { type: "array", items: { type: "string" } },
        transferableInsights: { type: "array", items: { type: "object" } },
        recommendations: { type: "array", items: { type: "string" } }
      },
      required: ["lessons", "recommendations"]
    }
  },

  patternRecognition: {
    system: `You are a pattern recognition specialist identifying trends and recurring themes across municipal data.`,
    
    buildPrompt: (context) => `Identify patterns:

Data Domain: ${context.domain}
Dataset: ${JSON.stringify(context.dataset, null, 2)}
Time Period: ${context.timePeriod}
Known Factors: ${context.knownFactors.join(', ')}

Discover:
1. Recurring patterns
2. Anomalies and outliers
3. Correlation insights
4. Causal hypotheses
5. Actionable findings`
  },

  bestPracticeExtraction: {
    system: `You are a best practice analyst identifying and codifying successful approaches.`,
    
    buildPrompt: (context) => `Extract best practices:

Domain: ${context.domain}
Successful Cases: ${JSON.stringify(context.successfulCases, null, 2)}
Performance Metrics: ${JSON.stringify(context.metrics, null, 2)}
Context Factors: ${context.contextFactors.join(', ')}

Document:
1. Best practices identified
2. Success criteria
3. Implementation guidelines
4. Adaptation considerations
5. Measurement framework`
  }
};

export default learningInsightsPrompts;
