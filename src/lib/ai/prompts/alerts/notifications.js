/**
 * Notification and Alert Prompts (Extended)
 * @module prompts/alerts/notifications
 */

export const alertPrompts = {
  urgencyClassification: {
    system: `You are an alert classification specialist determining the urgency and routing of municipal notifications.`,
    
    buildPrompt: (context) => `Classify alert urgency:

Alert Type: ${context.alertType}
Content: ${context.content}
Source: ${context.source}
Affected Entities: ${context.affectedEntities.join(', ')}

Determine:
1. Urgency level (critical/high/medium/low)
2. Required response time
3. Notification channels
4. Escalation triggers
5. Stakeholder routing`,

    schema: {
      type: "object",
      properties: {
        urgencyLevel: { type: "string", enum: ["critical", "high", "medium", "low"] },
        responseTime: { type: "string" },
        channels: { type: "array", items: { type: "string" } },
        escalationTriggers: { type: "array", items: { type: "object" } },
        stakeholders: { type: "array", items: { type: "string" } }
      },
      required: ["urgencyLevel", "responseTime", "channels"]
    }
  },

  notificationContent: {
    system: `You are a notification content specialist creating clear and actionable alert messages.`,
    
    buildPrompt: (context) => `Generate notification:

Event: ${context.event}
Audience: ${context.audience}
Urgency: ${context.urgency}
Action Required: ${context.actionRequired}

Create:
1. Subject line
2. Brief message
3. Detailed explanation
4. Action items
5. Follow-up timeline`
  },

  digestGeneration: {
    system: `You are a digest specialist consolidating multiple updates into organized summaries.`,
    
    buildPrompt: (context) => `Generate digest:

Updates: ${JSON.stringify(context.updates, null, 2)}
Time Period: ${context.timePeriod}
Recipient Profile: ${context.recipientProfile}

Compile:
1. Executive summary
2. Grouped updates by category
3. Priority highlights
4. Pending actions
5. Upcoming deadlines`
  }
};

export default alertPrompts;
