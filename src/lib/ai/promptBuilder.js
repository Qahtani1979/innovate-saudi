/**
 * Prompt Builder Utilities
 * Helper functions for constructing and managing AI prompts
 * @module lib/ai/promptBuilder
 */

import { SAUDI_CONTEXT, getSystemPrompt } from '@/lib/saudiContext';

/**
 * Build a complete prompt configuration for AI invocation
 * @param {Object} promptConfig - The prompt configuration from the library
 * @param {Object} context - Context data to populate the prompt
 * @returns {Object} Complete prompt ready for AI invocation
 */
export function buildPrompt(promptConfig, context) {
  if (!promptConfig) {
    throw new Error('Prompt configuration is required');
  }

  const result = {
    system_prompt: promptConfig.system || getSystemPrompt(),
    prompt: typeof promptConfig.buildPrompt === 'function' 
      ? promptConfig.buildPrompt(context)
      : promptConfig.prompt || '',
  };

  if (promptConfig.schema) {
    result.response_json_schema = promptConfig.schema;
  }

  return result;
}

/**
 * Build prompt with Saudi Arabia context
 * @param {Object} promptConfig - The prompt configuration
 * @param {Object} context - Context data
 * @param {string} language - 'en' or 'ar'
 * @returns {Object} Complete prompt with Saudi context
 */
export function buildPromptWithSaudiContext(promptConfig, context, language = 'en') {
  const basePrompt = buildPrompt(promptConfig, context);
  
  const saudiContextPrefix = `
Context: Saudi Arabia Municipal Innovation
Language: ${language === 'ar' ? 'Arabic' : 'English'}
Cultural Considerations: ${SAUDI_CONTEXT.cultural.join(', ')}
Regulatory Framework: Saudi Municipal Regulations

`;

  return {
    ...basePrompt,
    prompt: saudiContextPrefix + basePrompt.prompt
  };
}

/**
 * Combine multiple prompts for complex operations
 * @param {Array} promptConfigs - Array of prompt configurations
 * @param {Object} context - Shared context data
 * @returns {Object} Combined prompt configuration
 */
export function combinePrompts(promptConfigs, context) {
  const combinedPrompt = promptConfigs
    .map((config, index) => {
      const built = buildPrompt(config, context);
      return `## Task ${index + 1}\n${built.prompt}`;
    })
    .join('\n\n');

  return {
    system_prompt: promptConfigs[0]?.system || getSystemPrompt(),
    prompt: combinedPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: { type: "object" }
        }
      },
      required: ["results"]
    }
  };
}

/**
 * Create a bilingual prompt that returns both English and Arabic
 * @param {Object} promptConfig - The prompt configuration
 * @param {Object} context - Context data
 * @returns {Object} Bilingual prompt configuration
 */
export function buildBilingualPrompt(promptConfig, context) {
  const basePrompt = buildPrompt(promptConfig, context);
  
  return {
    ...basePrompt,
    prompt: basePrompt.prompt + `

IMPORTANT: Provide response in both English and Arabic where applicable.
Format bilingual fields as: { "en": "English text", "ar": "النص العربي" }`,
    response_json_schema: addBilingualSchema(promptConfig.schema)
  };
}

/**
 * Add bilingual support to a schema
 * @param {Object} schema - Original schema
 * @returns {Object} Schema with bilingual support
 */
function addBilingualSchema(schema) {
  if (!schema) return schema;
  
  return {
    ...schema,
    properties: {
      ...schema.properties,
      _bilingual: { type: "boolean", default: true }
    }
  };
}

/**
 * Validate prompt context has required fields
 * @param {Object} context - Context to validate
 * @param {Array} requiredFields - List of required field names
 * @returns {Object} Validation result
 */
export function validatePromptContext(context, requiredFields = []) {
  const missing = requiredFields.filter(field => !context[field]);
  
  return {
    valid: missing.length === 0,
    missing,
    message: missing.length > 0 
      ? `Missing required fields: ${missing.join(', ')}`
      : 'Context is valid'
  };
}

export default {
  buildPrompt,
  buildPromptWithSaudiContext,
  combinePrompts,
  buildBilingualPrompt,
  validatePromptContext
};
