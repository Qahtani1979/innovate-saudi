/**
 * Edge Function LLM Invocation Prompts
 * Centralized prompts for the invoke-llm edge function
 * @module edge/invokeLlm
 */

export const EDGE_LLM_SYSTEM_PROMPTS = {
  default: `You are a helpful AI assistant for the Saudi Arabian Innovation Ecosystem Platform (BALADI).
You provide accurate, bilingual (Arabic/English) responses focused on government innovation initiatives.`,

  analysis: `You are an expert analyst for Saudi Arabian government innovation initiatives.
Provide structured, data-driven insights aligned with Vision 2030 objectives.`,

  generation: `You are a content generation specialist for Saudi government platforms.
Create professional, bilingual content following government communication standards.`,

  classification: `You are a classification expert for government challenges and solutions.
Categorize items accurately based on sector, priority, and strategic alignment.`
};

export const EDGE_LLM_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    response: { type: "string" },
    confidence: { type: "number" },
    language: { type: "string" },
    metadata: {
      type: "object",
      properties: {
        tokens_used: { type: "number" },
        processing_time: { type: "number" },
        model: { type: "string" }
      }
    }
  },
  required: ["response"]
};

export const buildEdgeLlmPrompt = (request) => {
  const { type, content, context, language = 'en' } = request;
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';
  
  return `${langInstruction}

REQUEST TYPE: ${type || 'general'}

CONTENT:
${content || 'No content provided'}

CONTEXT:
${context || 'General platform context'}

Provide a helpful, accurate response.`;
};

export const EDGE_LLM_PROMPTS = {
  systems: EDGE_LLM_SYSTEM_PROMPTS,
  schema: EDGE_LLM_RESPONSE_SCHEMA,
  buildPrompt: buildEdgeLlmPrompt
};

export default EDGE_LLM_PROMPTS;
