import { base44 } from '@/api/base44Client';

/**
 * Generate bilingual AI responses (EN + AR)
 */
export async function generateBilingualResponse(prompt, responseSchema) {
  const [enResponse, arResponse] = await Promise.all([
    base44.integrations.Core.InvokeLLM({
      prompt: `${prompt}\n\nIMPORTANT: Respond in English only.`,
      response_json_schema: responseSchema
    }),
    base44.integrations.Core.InvokeLLM({
      prompt: `${prompt}\n\nIMPORTANT: Respond in Arabic only. استخدم اللغة العربية فقط.`,
      response_json_schema: responseSchema
    })
  ]);

  return {
    en: enResponse,
    ar: arResponse
  };
}

export function useBilingualAI() {
  const generate = async (prompt, schema) => {
    return await generateBilingualResponse(prompt, schema);
  };

  return { generate };
}