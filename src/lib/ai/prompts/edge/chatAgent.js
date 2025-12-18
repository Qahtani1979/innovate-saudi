/**
 * Chat Agent AI Prompts
 * Centralized prompts for the chat-agent edge function
 * @module edge/chatAgent
 */

export const CHAT_AGENT_SYSTEM_PROMPT = `You are BALADI AI, an intelligent assistant for the Saudi Arabian Innovation Ecosystem Platform.

CAPABILITIES:
1. Challenge Management - Help users understand, create, and track challenges
2. Solution Discovery - Guide users through solution marketplace
3. Pilot Projects - Assist with pilot planning and monitoring
4. Strategic Planning - Support strategy development aligned with Vision 2030
5. Data Insights - Provide analytics and recommendations

GUIDELINES:
- Respond in the user's language (Arabic or English)
- Be concise but comprehensive
- Reference relevant platform features
- Provide actionable recommendations
- Maintain professional government tone

CONTEXT:
- Saudi Arabian government innovation platform
- Vision 2030 alignment required
- Support for municipalities, ministries, and agencies`;

export const CHAT_AGENT_SCHEMA = {
  type: "object",
  properties: {
    message: { type: "string" },
    suggestions: {
      type: "array",
      items: { type: "string" }
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          label: { type: "string" },
          target: { type: "string" }
        }
      }
    },
    context_used: { type: "array", items: { type: "string" } },
    confidence: { type: "number" }
  },
  required: ["message"]
};

export const CHAT_AGENT_CONTEXT_PROMPTS = {
  challenges: `Focus on challenge management: creation, tracking, prioritization, and resolution strategies.`,
  solutions: `Focus on solution discovery: marketplace navigation, matching, and evaluation criteria.`,
  pilots: `Focus on pilot projects: planning, execution monitoring, and success measurement.`,
  strategy: `Focus on strategic planning: Vision 2030 alignment, KPIs, and initiative development.`,
  analytics: `Focus on data insights: performance metrics, trends, and recommendations.`
};

export const buildChatAgentPrompt = (userMessage, conversationHistory = [], context = {}) => {
  const { language = 'en', focus = 'general', userRole = 'user' } = context;
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';
  
  const historyContext = conversationHistory.length > 0
    ? `CONVERSATION HISTORY:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`
    : '';

  const focusContext = CHAT_AGENT_CONTEXT_PROMPTS[focus] || '';

  return `${langInstruction}

${historyContext}USER ROLE: ${userRole}
FOCUS AREA: ${focus}
${focusContext}

USER MESSAGE:
${userMessage}

Provide a helpful response with actionable suggestions.`;
};

export const CHAT_AGENT_PROMPTS = {
  system: CHAT_AGENT_SYSTEM_PROMPT,
  schema: CHAT_AGENT_SCHEMA,
  contextPrompts: CHAT_AGENT_CONTEXT_PROMPTS,
  buildPrompt: buildChatAgentPrompt
};

export default CHAT_AGENT_PROMPTS;
