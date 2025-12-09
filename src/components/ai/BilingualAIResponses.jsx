import { useAIWithFallback } from '@/hooks/useAIWithFallback';

/**
 * Generate bilingual AI responses (EN + AR)
 * Note: This is now a hook-based implementation for consistency
 */
export function useBilingualAI() {
  const { invokeAI, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generate = async (prompt, schema) => {
    const results = await Promise.all([
      invokeAI({
        prompt: `${prompt}\n\nIMPORTANT: Respond in English only.`,
        response_json_schema: schema
      }),
      invokeAI({
        prompt: `${prompt}\n\nIMPORTANT: Respond in Arabic only. استخدم اللغة العربية فقط.`,
        response_json_schema: schema
      })
    ]);

    return {
      en: results[0].success ? results[0].data : null,
      ar: results[1].success ? results[1].data : null,
      success: results[0].success && results[1].success
    };
  };

  return { generate, isLoading, isAvailable, rateLimitInfo };
}

// Legacy function for backward compatibility - deprecated
export async function generateBilingualResponse(prompt, responseSchema) {
  console.warn('generateBilingualResponse is deprecated. Use useBilingualAI hook instead.');
  // This function cannot work without the hook context
  // Return empty response to avoid breaking existing code
  return { en: null, ar: null };
}
