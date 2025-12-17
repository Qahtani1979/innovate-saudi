/**
 * Work prioritization prompts
 * @module work/prioritizer
 */

export const WORK_PRIORITIZER_SYSTEM_PROMPT = `You are an AI work prioritization assistant for a Saudi municipal innovation platform. Help users focus on their most impactful tasks.`;

export const createWorkPrioritizerPrompt = (context) => `You are an AI work prioritization assistant for a municipal innovation platform. Analyze the user's current work context and provide actionable priorities for today.

Context:
- Challenges: ${JSON.stringify(context.challenges)}
- Pilots: ${JSON.stringify(context.pilots)}
- Tasks: ${JSON.stringify(context.tasks)}

Based on urgency, impact, and dependencies, suggest the TOP 3 PRIORITIES for today. For each priority:
1. What to focus on (be specific)
2. Why it matters (brief explanation)
3. Quick action they can take (one sentence)

Format as a practical to-do list. Be concise and actionable.`;

export const WORK_PRIORITIZER_SCHEMA = {
  type: "object",
  properties: {
    priorities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          action: { type: "string" },
          urgency: { type: "string", enum: ["high", "medium", "low"] },
          entity_type: { type: "string" },
          entity_id: { type: "string" }
        }
      }
    },
    summary: { type: "string" }
  }
};
