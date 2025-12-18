/* @refresh reset */
/**
 * Bilingual Schema Builder Utilities
 * Helpers for creating consistent bilingual JSON schemas for AI responses
 * @version 1.0.1
 */

/**
 * Create a bilingual text field schema (English + Arabic)
 * @param {string} description - Field description
 * @returns {Object} Schema object with _en and _ar properties
 */
export function bilingualTextField(description = '') {
  return {
    type: 'object',
    properties: {
      _en: { type: 'string', description: `${description} (English)` },
      _ar: { type: 'string', description: `${description} (Arabic - formal MSA)` }
    },
    required: ['_en', '_ar']
  };
}

/**
 * Create flat bilingual fields (text_en, text_ar pattern)
 * @param {string} baseName - Base field name (e.g., 'title', 'description')
 * @param {string} description - Field description
 * @returns {Object} Schema properties object
 */
export function flatBilingualFields(baseName, description = '') {
  return {
    [`${baseName}_en`]: { type: 'string', description: `${description} (English)` },
    [`${baseName}_ar`]: { type: 'string', description: `${description} (Arabic - formal MSA)` }
  };
}

/**
 * Create a bilingual array item schema
 * @param {Object} additionalProps - Additional properties beyond text_en/text_ar
 * @returns {Object} Array item schema
 */
export function bilingualArrayItem(additionalProps = {}) {
  return {
    type: 'object',
    properties: {
      text_en: { type: 'string', description: 'Content in English' },
      text_ar: { type: 'string', description: 'Content in Arabic (formal MSA)' },
      ...additionalProps
    },
    required: ['text_en', 'text_ar', ...Object.keys(additionalProps).filter(k => additionalProps[k].required)]
  };
}

/**
 * Create a priority field schema
 * @param {Array<string>} levels - Priority levels
 * @returns {Object} Schema property
 */
export function priorityField(levels = ['high', 'medium', 'low']) {
  return {
    type: 'string',
    enum: levels,
    description: 'Priority level'
  };
}

/**
 * Create a category field with bilingual support
 * @param {string} description - Category description
 * @returns {Object} Schema properties
 */
export function bilingualCategoryField(description = 'Category') {
  return {
    category_en: { type: 'string', description: `${description} (English)` },
    category_ar: { type: 'string', description: `${description} (Arabic)` }
  };
}

/**
 * Create a confidence/score field
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} Schema property
 */
export function scoreField(min = 0, max = 100) {
  return {
    type: 'number',
    minimum: min,
    maximum: max,
    description: `Score from ${min} to ${max}`
  };
}

/**
 * Create a standard bilingual list schema (for things like strengths, recommendations)
 * @param {string} itemDescription - Description of each item
 * @param {Object} extraItemProps - Additional properties per item
 * @returns {Object} Array schema
 */
export function bilingualListSchema(itemDescription, extraItemProps = {}) {
  return {
    type: 'array',
    items: bilingualArrayItem({
      priority: priorityField(),
      ...extraItemProps
    }),
    description: itemDescription
  };
}

/**
 * Create a complete bilingual entity schema
 * @param {Object} config - Configuration object
 * @returns {Object} Complete JSON schema
 */
export function createBilingualSchema(config) {
  const {
    title,
    description,
    properties,
    required = [],
    additionalProperties = false
  } = config;

  return {
    type: 'object',
    title,
    description,
    properties,
    required,
    additionalProperties
  };
}

/**
 * Standard schema patterns for common AI response types
 */
export const SCHEMA_PATTERNS = {
  /**
   * Recommendations list pattern
   */
  recommendations: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        priority: priorityField(),
        rationale_en: { type: 'string' },
        rationale_ar: { type: 'string' }
      },
      required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'priority']
    }
  },

  /**
   * Analysis results pattern
   */
  analysis: {
    type: 'object',
    properties: {
      summary_en: { type: 'string' },
      summary_ar: { type: 'string' },
      findings: {
        type: 'array',
        items: bilingualArrayItem({ severity: priorityField(['critical', 'high', 'medium', 'low']) })
      },
      recommendations: {
        type: 'array',
        items: bilingualArrayItem({ priority: priorityField() })
      },
      score: scoreField(0, 100)
    },
    required: ['summary_en', 'summary_ar', 'findings', 'recommendations']
  },

  /**
   * Suggestions list pattern
   */
  suggestions: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        suggestion_en: { type: 'string' },
        suggestion_ar: { type: 'string' },
        category_en: { type: 'string' },
        category_ar: { type: 'string' },
        confidence: scoreField(0, 100)
      },
      required: ['suggestion_en', 'suggestion_ar']
    }
  },

  /**
   * Assessment result pattern
   */
  assessment: {
    type: 'object',
    properties: {
      overall_score: scoreField(0, 100),
      status: { type: 'string', enum: ['excellent', 'good', 'fair', 'needs_improvement', 'critical'] },
      summary_en: { type: 'string' },
      summary_ar: { type: 'string' },
      strengths: bilingualListSchema('Key strengths identified'),
      weaknesses: bilingualListSchema('Areas for improvement'),
      next_steps: bilingualListSchema('Recommended next steps')
    },
    required: ['overall_score', 'status', 'summary_en', 'summary_ar']
  }
};

/**
 * Wrap a schema for use with invoke-llm
 * @param {Object} schema - The response schema
 * @returns {Object} Wrapped schema ready for AI invocation
 */
export function wrapForInvocation(schema) {
  return {
    type: 'object',
    properties: {
      response: schema
    },
    required: ['response']
  };
}

/**
 * Build a bilingual response schema with en/ar properties
 * @param {Object} config - Schema configuration
 * @returns {Object} JSON schema with bilingual fields
 */
export function buildBilingualResponseSchema(config) {
  const { properties = {}, required = [] } = config;
  
  const bilingualProperties = {};
  
  Object.entries(properties).forEach(([key, prop]) => {
    if (prop.bilingual) {
      // Convert to bilingual object with en/ar
      bilingualProperties[key] = {
        type: 'object',
        properties: {
          en: { type: 'string', description: `${prop.description || key} (English)` },
          ar: { type: 'string', description: `${prop.description || key} (Arabic)` }
        },
        required: ['en', 'ar']
      };
    } else if (prop.type === 'array' && prop.items?.bilingual) {
      // Array of bilingual items
      bilingualProperties[key] = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            en: { type: 'string' },
            ar: { type: 'string' },
            ...prop.items.additionalProperties
          },
          required: ['en', 'ar']
        }
      };
    } else {
      bilingualProperties[key] = prop;
    }
  });
  
  return {
    type: 'object',
    properties: bilingualProperties,
    required
  };
}

export default {
  bilingualTextField,
  flatBilingualFields,
  bilingualArrayItem,
  priorityField,
  bilingualCategoryField,
  scoreField,
  bilingualListSchema,
  createBilingualSchema,
  wrapForInvocation,
  buildBilingualResponseSchema,
  SCHEMA_PATTERNS
};
