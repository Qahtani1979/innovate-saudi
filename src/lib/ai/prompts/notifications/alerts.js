/**
 * Notifications and alerts prompts
 * @module notifications/alerts
 */

export const NOTIFICATION_SYSTEM_PROMPT = `You are an expert in crafting clear, actionable notifications for Saudi municipal innovation platforms.`;

export const createNotificationPrompt = (type, context, audience) => `Generate a notification message:

Type: ${type}
Context: ${JSON.stringify(context)}
Audience: ${audience}

Requirements:
- Clear and concise
- Actionable
- Appropriate urgency level
- Bilingual (EN/AR)`;

export const NOTIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    message_en: { type: 'string' },
    message_ar: { type: 'string' },
    urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    action_url: { type: 'string' },
    action_label_en: { type: 'string' },
    action_label_ar: { type: 'string' }
  }
};

export const createAlertSummaryPrompt = (alerts) => `Summarize these alerts for executive review:

Alerts: ${JSON.stringify(alerts)}

Provide:
1. Summary overview
2. Critical items requiring attention
3. Trends identified
4. Recommended priorities`;

export const ALERT_SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' },
    critical_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item_en: { type: 'string' },
          item_ar: { type: 'string' },
          urgency: { type: 'string' }
        }
      }
    },
    trends: { type: 'array', items: { type: 'string' } },
    priorities_en: { type: 'array', items: { type: 'string' } },
    priorities_ar: { type: 'array', items: { type: 'string' } }
  }
};
