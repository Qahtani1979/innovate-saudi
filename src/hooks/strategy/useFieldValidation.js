import { useMemo, useCallback } from 'react';

/**
 * useFieldValidation - Centralized field validation hook for wizard steps
 * 
 * @param {Object} config - Validation configuration
 * @param {Object} config.data - Form data to validate
 * @param {Array} config.rules - Array of validation rules
 * @param {string} config.language - Current language for messages
 * @returns {Object} Validation state and utilities
 */
export function useFieldValidation({ data, rules = [], language = 'en' }) {
  
  // Core validation types
  const validators = {
    required: (value, options = {}) => {
      const isEmpty = value === null || value === undefined || value === '' || 
                      (Array.isArray(value) && value.length === 0);
      return {
        valid: !isEmpty,
        message: options.message || { en: 'This field is required', ar: 'هذا الحقل مطلوب' }
      };
    },
    
    minLength: (value, options = {}) => {
      const length = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
      const min = options.min || 1;
      return {
        valid: length >= min,
        message: options.message || { 
          en: `Minimum ${min} ${options.unit || 'characters'} required`, 
          ar: `الحد الأدنى ${min} ${options.unit_ar || 'أحرف'} مطلوب` 
        }
      };
    },
    
    maxLength: (value, options = {}) => {
      const length = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
      const max = options.max || 100;
      return {
        valid: length <= max,
        message: options.message || { 
          en: `Maximum ${max} ${options.unit || 'characters'} allowed`, 
          ar: `الحد الأقصى ${max} ${options.unit_ar || 'حرف'} مسموح` 
        }
      };
    },
    
    minItems: (value, options = {}) => {
      const count = Array.isArray(value) ? value.length : 0;
      const min = options.min || 1;
      return {
        valid: count >= min,
        message: options.message || { 
          en: `At least ${min} ${options.itemName || 'items'} required`, 
          ar: `مطلوب ${min} ${options.itemName_ar || 'عناصر'} على الأقل` 
        }
      };
    },
    
    maxItems: (value, options = {}) => {
      const count = Array.isArray(value) ? value.length : 0;
      const max = options.max || 100;
      return {
        valid: count <= max,
        message: options.message || { 
          en: `Maximum ${max} ${options.itemName || 'items'} allowed`, 
          ar: `الحد الأقصى ${max} ${options.itemName_ar || 'عنصر'} مسموح` 
        }
      };
    },
    
    pattern: (value, options = {}) => {
      const regex = options.pattern instanceof RegExp ? options.pattern : new RegExp(options.pattern);
      return {
        valid: !value || regex.test(value),
        message: options.message || { en: 'Invalid format', ar: 'تنسيق غير صالح' }
      };
    },
    
    bilingual: (value, options = {}) => {
      const hasEn = value?.en && value.en.trim() !== '';
      const hasAr = value?.ar && value.ar.trim() !== '';
      const requireBoth = options.requireBoth !== false;
      
      return {
        valid: requireBoth ? (hasEn && hasAr) : (hasEn || hasAr),
        message: options.message || { 
          en: requireBoth ? 'Both English and Arabic are required' : 'At least one language is required', 
          ar: requireBoth ? 'مطلوب كل من الإنجليزية والعربية' : 'مطلوب لغة واحدة على الأقل' 
        }
      };
    },
    
    dateRange: (value, options = {}) => {
      const startDate = options.startField ? getNestedValue(data, options.startField) : value?.start;
      const endDate = options.endField ? getNestedValue(data, options.endField) : value?.end;
      
      if (!startDate || !endDate) return { valid: true, message: null };
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return {
        valid: start <= end,
        message: options.message || { en: 'End date must be after start date', ar: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء' }
      };
    },
    
    number: (value, options = {}) => {
      if (!value && value !== 0) return { valid: true, message: null };
      
      const num = parseFloat(value);
      const isValid = !isNaN(num) && 
                      (options.min === undefined || num >= options.min) &&
                      (options.max === undefined || num <= options.max);
      
      return {
        valid: isValid,
        message: options.message || { 
          en: options.min !== undefined && options.max !== undefined 
            ? `Value must be between ${options.min} and ${options.max}`
            : options.min !== undefined 
              ? `Value must be at least ${options.min}`
              : `Value must be at most ${options.max}`,
          ar: options.min !== undefined && options.max !== undefined 
            ? `يجب أن تكون القيمة بين ${options.min} و ${options.max}`
            : options.min !== undefined 
              ? `يجب أن تكون القيمة ${options.min} على الأقل`
              : `يجب أن تكون القيمة ${options.max} كحد أقصى`
        }
      };
    },
    
    custom: (value, options = {}) => {
      const isValid = options.validate ? options.validate(value, data) : true;
      return {
        valid: isValid,
        message: options.message || { en: 'Invalid value', ar: 'قيمة غير صالحة' }
      };
    }
  };
  
  // Helper to get nested value from object
  const getNestedValue = useCallback((obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);
  
  // Validate a single field
  const validateField = useCallback((fieldPath, fieldRules) => {
    const value = getNestedValue(data, fieldPath);
    const errors = [];
    const warnings = [];
    
    for (const rule of fieldRules) {
      const { type, level = 'error', ...options } = rule;
      const validator = validators[type];
      
      if (validator) {
        const result = validator(value, options);
        if (!result.valid) {
          const message = typeof result.message === 'object' 
            ? result.message[language] || result.message.en 
            : result.message;
          
          if (level === 'warning') {
            warnings.push({ field: fieldPath, message, type });
          } else {
            errors.push({ field: fieldPath, message, type });
          }
        }
      }
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  }, [data, language, getNestedValue]);
  
  // Run all validations
  const validation = useMemo(() => {
    const allErrors = [];
    const allWarnings = [];
    const fieldStates = {};
    
    for (const { field, rules: fieldRules } of rules) {
      const result = validateField(field, fieldRules);
      fieldStates[field] = {
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings
      };
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      fieldStates,
      errorCount: allErrors.length,
      warningCount: allWarnings.length
    };
  }, [rules, validateField]);
  
  // Get validation state for a specific field
  const getFieldValidation = useCallback((fieldPath) => {
    return validation.fieldStates[fieldPath] || { isValid: true, errors: [], warnings: [] };
  }, [validation.fieldStates]);
  
  // Check if a specific field has errors
  const hasFieldError = useCallback((fieldPath) => {
    const state = validation.fieldStates[fieldPath];
    return state ? !state.isValid : false;
  }, [validation.fieldStates]);
  
  // Get error message for a field
  const getFieldError = useCallback((fieldPath) => {
    const state = validation.fieldStates[fieldPath];
    return state?.errors?.[0]?.message || null;
  }, [validation.fieldStates]);
  
  // Calculate completeness score (0-100)
  const completenessScore = useMemo(() => {
    if (rules.length === 0) return 100;
    
    const validFields = Object.values(validation.fieldStates).filter(s => s.isValid).length;
    return Math.round((validFields / rules.length) * 100);
  }, [rules.length, validation.fieldStates]);
  
  return {
    ...validation,
    completenessScore,
    getFieldValidation,
    hasFieldError,
    getFieldError,
    validateField,
    validators
  };
}

/**
 * createValidationRules - Helper to create validation rule objects
 */
export const createValidationRules = {
  required: (message) => ({ type: 'required', message }),
  minLength: (min, options = {}) => ({ type: 'minLength', min, ...options }),
  maxLength: (max, options = {}) => ({ type: 'maxLength', max, ...options }),
  minItems: (min, options = {}) => ({ type: 'minItems', min, ...options }),
  maxItems: (max, options = {}) => ({ type: 'maxItems', max, ...options }),
  pattern: (pattern, message) => ({ type: 'pattern', pattern, message }),
  bilingual: (requireBoth = true) => ({ type: 'bilingual', requireBoth }),
  dateRange: (startField, endField) => ({ type: 'dateRange', startField, endField }),
  number: (options = {}) => ({ type: 'number', ...options }),
  custom: (validate, message) => ({ type: 'custom', validate, message }),
  warning: (rule) => ({ ...rule, level: 'warning' })
};

export default useFieldValidation;
