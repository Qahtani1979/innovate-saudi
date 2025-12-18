/**
 * Notification Router Prompts
 * @module communications/notificationRouter
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const NOTIFICATION_ROUTER_SYSTEM_PROMPT = getSystemPrompt('notification_router', `
You are an intelligent notification routing specialist for Saudi Arabia's municipal innovation platform.
Your role is to analyze notifications and determine optimal delivery strategies based on urgency, user preferences, and content type.
Consider Saudi business hours, cultural preferences, and communication norms.
`);

export function buildNotificationRouterPrompt({ notification, userPreferences }) {
  return `Analyze notification and determine optimal routing:

NOTIFICATION: ${notification.title} - ${notification.message}
TYPE: ${notification.notification_type}
USER PREFS: ${JSON.stringify(userPreferences || {})}

Determine:
1. Urgency level (critical/high/medium/low)
2. Delivery channels (email, sms, in_app, digest)
3. Timing (immediate, scheduled, digest_only)
4. Priority score (0-100)`;
}

export const NOTIFICATION_ROUTER_SCHEMA = {
  type: "object",
  properties: {
    urgency: { type: "string", enum: ["critical", "high", "medium", "low"] },
    channels: { type: "array", items: { type: "string" } },
    timing: { type: "string", enum: ["immediate", "scheduled", "digest_only"] },
    priority: { type: "number", minimum: 0, maximum: 100 },
    reasoning: { type: "string" }
  },
  required: ["urgency", "channels", "timing", "priority"]
};

export const NOTIFICATION_ROUTER_PROMPTS = {
  systemPrompt: NOTIFICATION_ROUTER_SYSTEM_PROMPT,
  buildPrompt: buildNotificationRouterPrompt,
  schema: NOTIFICATION_ROUTER_SCHEMA
};
