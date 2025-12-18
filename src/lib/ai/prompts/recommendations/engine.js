/**
 * Recommendation Engine Prompts
 * @module prompts/recommendations/engine
 */

export const recommendationPrompts = {
  contentRecommendation: {
    system: `You are a content recommendation specialist suggesting relevant resources to municipal users.`,
    
    buildPrompt: (context) => `Generate recommendations:

User Profile: ${JSON.stringify(context.userProfile, null, 2)}
Current Context: ${context.currentContext}
Available Content: ${context.availableContent.join(', ')}
History: ${JSON.stringify(context.history, null, 2)}

Recommend:
1. Top 5 content items
2. Relevance scores
3. Personalization reasoning
4. Discovery suggestions
5. Learning path`,

    schema: {
      type: "object",
      properties: {
        recommendations: { type: "array", items: { type: "object" } },
        reasoning: { type: "string" },
        discoveryItems: { type: "array", items: { type: "object" } },
        learningPath: { type: "array", items: { type: "object" } }
      },
      required: ["recommendations"]
    }
  },

  actionRecommendation: {
    system: `You are an action recommendation specialist suggesting next steps for municipal initiatives.`,
    
    buildPrompt: (context) => `Recommend actions:

Current State: ${JSON.stringify(context.currentState, null, 2)}
Goals: ${context.goals.join(', ')}
Constraints: ${context.constraints.join(', ')}
Resources: ${context.resources}

Suggest:
1. Immediate actions
2. Short-term priorities
3. Long-term initiatives
4. Risk mitigation steps
5. Quick wins`
  },

  partnerRecommendation: {
    system: `You are a partner recommendation specialist matching organizations for collaboration.`,
    
    buildPrompt: (context) => `Recommend partners:

Organization: ${JSON.stringify(context.organization, null, 2)}
Collaboration Goals: ${context.goals.join(', ')}
Available Partners: ${JSON.stringify(context.availablePartners, null, 2)}

Match:
1. Top partner candidates
2. Compatibility scores
3. Synergy areas
4. Engagement approach
5. Success factors`
  }
};

export default recommendationPrompts;
