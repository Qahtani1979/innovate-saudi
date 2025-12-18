/**
 * User Experience Prompts
 * @module prompts/ux/experience
 */

export const uxPrompts = {
  personalization: {
    system: `You are a personalization specialist tailoring user experiences based on preferences and behavior.`,
    
    buildPrompt: (context) => `Personalize experience:

User Profile: ${JSON.stringify(context.userProfile, null, 2)}
Behavior History: ${JSON.stringify(context.behaviorHistory, null, 2)}
Available Content: ${context.availableContent.join(', ')}

Recommend:
1. Content prioritization
2. Feature highlighting
3. Navigation shortcuts
4. Notification preferences
5. Dashboard customization`,

    schema: {
      type: "object",
      properties: {
        contentPriority: { type: "array", items: { type: "object" } },
        featureHighlights: { type: "array", items: { type: "string" } },
        shortcuts: { type: "array", items: { type: "object" } },
        notificationSettings: { type: "object" },
        dashboardLayout: { type: "object" }
      },
      required: ["contentPriority", "featureHighlights"]
    }
  },

  onboardingFlow: {
    system: `You are an onboarding specialist creating effective user introduction experiences.`,
    
    buildPrompt: (context) => `Design onboarding:

User Type: ${context.userType}
Role: ${context.role}
Key Features: ${context.keyFeatures.join(', ')}
Goals: ${context.goals.join(', ')}

Create:
1. Welcome sequence
2. Feature introduction order
3. Interactive tutorials
4. Success milestones
5. Support touchpoints`
  },

  feedbackAnalysis: {
    system: `You are a user feedback analyst identifying improvement opportunities from user input.`,
    
    buildPrompt: (context) => `Analyze user feedback:

Feedback Data: ${JSON.stringify(context.feedbackData, null, 2)}
Categories: ${context.categories.join(', ')}
Time Period: ${context.timePeriod}

Identify:
1. Common themes
2. Pain points
3. Feature requests
4. Satisfaction drivers
5. Priority improvements`
  }
};

export default uxPrompts;
