/**
 * usePrompt Hook
 * React hook for using centralized AI prompts with the AI fallback system
 * @module hooks/usePrompt
 */

import { useCallback, useMemo } from 'react';
import { useAIWithFallback } from './useAIWithFallback';
import { buildPrompt, buildPromptWithSaudiContext, validatePromptContext } from '@/lib/ai/promptBuilder';

/**
 * Hook for invoking AI with prompts from the centralized library
 * @param {Object} promptConfig - Prompt configuration from the library
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function usePrompt(promptConfig, options = {}) {
  const {
    useSaudiContext = true,
    language = 'en',
    requiredFields = [],
    ...aiOptions
  } = options;

  const ai = useAIWithFallback(aiOptions);

  const invoke = useCallback(async (context) => {
    // Validate context if required fields specified
    if (requiredFields.length > 0) {
      const validation = validatePromptContext(context, requiredFields);
      if (!validation.valid) {
        console.warn('Prompt context validation failed:', validation.message);
      }
    }

    // Build the prompt
    const builtPrompt = useSaudiContext
      ? buildPromptWithSaudiContext(promptConfig, context, language)
      : buildPrompt(promptConfig, context);

    // Invoke AI
    return ai.invokeAI({
      prompt: builtPrompt.prompt,
      system_prompt: builtPrompt.system_prompt,
      response_json_schema: builtPrompt.response_json_schema
    });
  }, [promptConfig, useSaudiContext, language, requiredFields, ai]);

  const promptInfo = useMemo(() => ({
    hasSchema: !!promptConfig?.schema,
    systemPromptPreview: promptConfig?.system?.substring(0, 100) + '...',
    requiredFields
  }), [promptConfig, requiredFields]);

  return {
    invoke,
    promptInfo,
    ...ai
  };
}

/**
 * Hook for batch prompt invocation
 * @param {Array} promptConfigs - Array of prompt configurations
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function usePromptBatch(promptConfigs, options = {}) {
  const ai = useAIWithFallback(options);

  const invokeBatch = useCallback(async (contexts) => {
    const results = [];
    
    for (let i = 0; i < promptConfigs.length; i++) {
      const config = promptConfigs[i];
      const context = contexts[i] || contexts;
      
      const builtPrompt = buildPrompt(config, context);
      
      const result = await ai.invokeAI({
        prompt: builtPrompt.prompt,
        system_prompt: builtPrompt.system_prompt,
        response_json_schema: builtPrompt.response_json_schema
      });
      
      results.push(result);
      
      // Stop if rate limited
      if (result.rateLimited) break;
    }
    
    return results;
  }, [promptConfigs, ai]);

  return {
    invokeBatch,
    ...ai
  };
}

export default usePrompt;
