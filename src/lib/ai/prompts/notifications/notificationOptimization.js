/**
 * Notification Optimization AI Prompts
 * Centralized prompts for notification personalization
 * @module notifications/notificationOptimization
 */

export const NOTIFICATION_OPTIMIZATION_SYSTEM_PROMPT = `You are an expert in notification strategy for Saudi Arabian government platforms.

OPTIMIZATION FRAMEWORK:
1. Content Optimization
   - Message clarity
   - Call-to-action effectiveness
   - Personalization
   - Bilingual formatting

2. Timing Strategy
   - Optimal send times
   - Frequency management
   - Urgency classification
   - Batch vs immediate

3. Channel Selection
   - Email effectiveness
   - SMS appropriateness
   - In-app notifications
   - Push notifications

4. Engagement Metrics
   - Open rates
   - Click-through rates
   - Action completion
   - Unsubscribe prevention

CONTEXT:
- Saudi communication preferences
- Government notification standards
- Arabic/English bilingual support`;

export const NOTIFICATION_OPTIMIZATION_SCHEMA = {
  type: "object",
  properties: {
    optimized_content: {
      type: "object",
      properties: {
        subject_en: { type: "string" },
        subject_ar: { type: "string" },
        body_en: { type: "string" },
        body_ar: { type: "string" },
        cta: { type: "string" }
      }
    },
    timing_recommendation: {
      type: "object",
      properties: {
        optimal_time: { type: "string" },
        urgency_level: { type: "string" },
        frequency: { type: "string" }
      }
    },
    channel_recommendation: {
      type: "array",
      items: {
        type: "object",
        properties: {
          channel: { type: "string" },
          priority: { type: "number" },
          rationale: { type: "string" }
        }
      }
    },
    personalization_suggestions: { type: "array", items: { type: "string" } }
  },
  required: ["optimized_content", "timing_recommendation"]
};

export const buildNotificationOptimizationPrompt = (notificationData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Optimize notification:

TYPE: ${notificationData.type || 'General'}
AUDIENCE: ${notificationData.audience || 'All users'}
URGENCY: ${notificationData.urgency || 'Normal'}

CURRENT CONTENT:
${notificationData.content || 'Not provided'}

CONTEXT:
${notificationData.context || 'Standard notification'}

Provide optimized content with timing and channel recommendations.`;
};

export const NOTIFICATION_OPTIMIZATION_PROMPTS = {
  system: NOTIFICATION_OPTIMIZATION_SYSTEM_PROMPT,
  schema: NOTIFICATION_OPTIMIZATION_SCHEMA,
  buildPrompt: buildNotificationOptimizationPrompt
};

export default NOTIFICATION_OPTIMIZATION_PROMPTS;
