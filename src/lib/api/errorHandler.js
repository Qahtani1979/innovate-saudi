/**
 * API Error Handler
 * Implements: api-7 (error codes), api-8 (safe error messages), api-9 (error logging)
 */

// Standardized error codes
export const API_ERROR_CODES = {
  // Validation errors (E1xx)
  VALIDATION_ERROR: 'E100',
  INVALID_INPUT: 'E101',
  MISSING_REQUIRED_FIELD: 'E102',
  INVALID_FORMAT: 'E103',
  VALUE_OUT_OF_RANGE: 'E104',
  
  // Authentication errors (E2xx)
  UNAUTHORIZED: 'E200',
  INVALID_TOKEN: 'E201',
  TOKEN_EXPIRED: 'E202',
  SESSION_EXPIRED: 'E203',
  
  // Authorization errors (E3xx)
  FORBIDDEN: 'E300',
  INSUFFICIENT_PERMISSIONS: 'E301',
  RESOURCE_ACCESS_DENIED: 'E302',
  ROLE_REQUIRED: 'E303',
  
  // Resource errors (E4xx)
  NOT_FOUND: 'E400',
  RESOURCE_DELETED: 'E401',
  RESOURCE_ARCHIVED: 'E402',
  DUPLICATE_RESOURCE: 'E403',
  
  // Rate limiting errors (E5xx)
  RATE_LIMITED: 'E500',
  QUOTA_EXCEEDED: 'E501',
  TOO_MANY_REQUESTS: 'E502',
  
  // Server errors (E9xx)
  SERVER_ERROR: 'E900',
  DATABASE_ERROR: 'E901',
  EXTERNAL_SERVICE_ERROR: 'E902',
  TIMEOUT_ERROR: 'E903',
  UNKNOWN_ERROR: 'E999'
};

// Error categories for grouping
export const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  RESOURCE: 'resource',
  RATE_LIMIT: 'rate_limit',
  SERVER: 'server'
};

// Map error codes to categories
const ERROR_CODE_CATEGORIES = {
  E100: ERROR_CATEGORIES.VALIDATION,
  E101: ERROR_CATEGORIES.VALIDATION,
  E102: ERROR_CATEGORIES.VALIDATION,
  E103: ERROR_CATEGORIES.VALIDATION,
  E104: ERROR_CATEGORIES.VALIDATION,
  E200: ERROR_CATEGORIES.AUTHENTICATION,
  E201: ERROR_CATEGORIES.AUTHENTICATION,
  E202: ERROR_CATEGORIES.AUTHENTICATION,
  E203: ERROR_CATEGORIES.AUTHENTICATION,
  E300: ERROR_CATEGORIES.AUTHORIZATION,
  E301: ERROR_CATEGORIES.AUTHORIZATION,
  E302: ERROR_CATEGORIES.AUTHORIZATION,
  E303: ERROR_CATEGORIES.AUTHORIZATION,
  E400: ERROR_CATEGORIES.RESOURCE,
  E401: ERROR_CATEGORIES.RESOURCE,
  E402: ERROR_CATEGORIES.RESOURCE,
  E403: ERROR_CATEGORIES.RESOURCE,
  E500: ERROR_CATEGORIES.RATE_LIMIT,
  E501: ERROR_CATEGORIES.RATE_LIMIT,
  E502: ERROR_CATEGORIES.RATE_LIMIT,
  E900: ERROR_CATEGORIES.SERVER,
  E901: ERROR_CATEGORIES.SERVER,
  E902: ERROR_CATEGORIES.SERVER,
  E903: ERROR_CATEGORIES.SERVER,
  E999: ERROR_CATEGORIES.SERVER
};

// Safe user-facing messages (never expose internal details)
const SAFE_ERROR_MESSAGES = {
  [API_ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [API_ERROR_CODES.INVALID_INPUT]: 'The provided input is invalid.',
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [API_ERROR_CODES.INVALID_FORMAT]: 'The format of your input is incorrect.',
  [API_ERROR_CODES.VALUE_OUT_OF_RANGE]: 'The value is outside the allowed range.',
  [API_ERROR_CODES.UNAUTHORIZED]: 'Please sign in to continue.',
  [API_ERROR_CODES.INVALID_TOKEN]: 'Your session is invalid. Please sign in again.',
  [API_ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [API_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [API_ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action.',
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'You do not have the required permissions.',
  [API_ERROR_CODES.RESOURCE_ACCESS_DENIED]: 'You cannot access this resource.',
  [API_ERROR_CODES.ROLE_REQUIRED]: 'This action requires a specific role.',
  [API_ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [API_ERROR_CODES.RESOURCE_DELETED]: 'This resource has been deleted.',
  [API_ERROR_CODES.RESOURCE_ARCHIVED]: 'This resource has been archived.',
  [API_ERROR_CODES.DUPLICATE_RESOURCE]: 'A resource with this information already exists.',
  [API_ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [API_ERROR_CODES.QUOTA_EXCEEDED]: 'You have exceeded your quota. Please try again later.',
  [API_ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests. Please slow down.',
  [API_ERROR_CODES.SERVER_ERROR]: 'Something went wrong. Please try again later.',
  [API_ERROR_CODES.DATABASE_ERROR]: 'Unable to complete the operation. Please try again.',
  [API_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'A service is temporarily unavailable.',
  [API_ERROR_CODES.TIMEOUT_ERROR]: 'The operation timed out. Please try again.',
  [API_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

// Arabic translations
const SAFE_ERROR_MESSAGES_AR = {
  [API_ERROR_CODES.VALIDATION_ERROR]: 'يرجى التحقق من إدخالاتك والمحاولة مرة أخرى.',
  [API_ERROR_CODES.INVALID_INPUT]: 'الإدخال المقدم غير صالح.',
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'يرجى ملء جميع الحقول المطلوبة.',
  [API_ERROR_CODES.UNAUTHORIZED]: 'يرجى تسجيل الدخول للمتابعة.',
  [API_ERROR_CODES.FORBIDDEN]: 'ليس لديك إذن لتنفيذ هذا الإجراء.',
  [API_ERROR_CODES.NOT_FOUND]: 'المورد المطلوب غير موجود.',
  [API_ERROR_CODES.RATE_LIMITED]: 'طلبات كثيرة جداً. يرجى الانتظار والمحاولة مرة أخرى.',
  [API_ERROR_CODES.SERVER_ERROR]: 'حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.'
};

/**
 * Create a structured API error
 */
export class ApiError extends Error {
  constructor(code, options = {}) {
    const message = options.message || SAFE_ERROR_MESSAGES[code] || SAFE_ERROR_MESSAGES[API_ERROR_CODES.UNKNOWN_ERROR];
    super(message);
    
    this.code = code;
    this.category = ERROR_CODE_CATEGORIES[code] || ERROR_CATEGORIES.SERVER;
    this.field = options.field || null;
    this.details = options.details || null; // For internal logging only
    this.timestamp = new Date().toISOString();
    this.requestId = options.requestId || generateRequestId();
  }
  
  toSafeResponse(language = 'en') {
    const messages = language === 'ar' ? SAFE_ERROR_MESSAGES_AR : SAFE_ERROR_MESSAGES;
    return {
      success: false,
      error: {
        code: this.code,
        message: messages[this.code] || this.message,
        category: this.category,
        field: this.field,
        requestId: this.requestId,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Generate unique request ID for error tracking
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format API error for safe user display
 * Never exposes internal error details (api-8)
 */
export function formatApiError(error, context = {}) {
  // Determine error code
  let code = API_ERROR_CODES.UNKNOWN_ERROR;
  let field = null;
  
  if (error instanceof ApiError) {
    return error.toSafeResponse(context.language);
  }
  
  // Map common Supabase errors
  if (error?.code === 'PGRST116') {
    code = API_ERROR_CODES.NOT_FOUND;
  } else if (error?.code === '23505') {
    code = API_ERROR_CODES.DUPLICATE_RESOURCE;
  } else if (error?.code === '42501' || error?.message?.includes('permission')) {
    code = API_ERROR_CODES.FORBIDDEN;
  } else if (error?.code === 'JWT_EXPIRED' || error?.message?.includes('JWT')) {
    code = API_ERROR_CODES.TOKEN_EXPIRED;
  } else if (error?.message?.includes('rate limit')) {
    code = API_ERROR_CODES.RATE_LIMITED;
  } else if (error?.message?.includes('validation') || error?.name === 'ZodError') {
    code = API_ERROR_CODES.VALIDATION_ERROR;
    field = error?.errors?.[0]?.path?.join('.') || null;
  }
  
  // Log full error internally (api-9)
  logError(error, { ...context, mappedCode: code });
  
  // Return safe response
  const safeMessage = SAFE_ERROR_MESSAGES[code] || SAFE_ERROR_MESSAGES[API_ERROR_CODES.UNKNOWN_ERROR];
  
  return {
    success: false,
    error: {
      code,
      message: safeMessage,
      category: ERROR_CODE_CATEGORIES[code] || ERROR_CATEGORIES.SERVER,
      field,
      requestId: context.requestId || generateRequestId(),
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Internal error logging (api-9)
 * Logs full error details for debugging without exposing to users
 */
export function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    requestId: context.requestId || generateRequestId(),
    error: {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 5) // Limit stack trace
    },
    context: {
      userId: context.userId,
      action: context.action,
      entityType: context.entityType,
      entityId: context.entityId,
      mappedCode: context.mappedCode
    }
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[API Error]', logEntry);
  }
  
  // In production, this would be sent to a logging service
  // For now, we store in sessionStorage for debugging
  try {
    const errorLogs = JSON.parse(sessionStorage.getItem('api_error_logs') || '[]');
    errorLogs.push(logEntry);
    // Keep only last 50 errors
    if (errorLogs.length > 50) {
      errorLogs.shift();
    }
    sessionStorage.setItem('api_error_logs', JSON.stringify(errorLogs));
  } catch (e) {
    // Ignore storage errors
  }
  
  return logEntry;
}

/**
 * Create validation error from Zod result
 */
export function createValidationError(zodResult) {
  if (zodResult.success) return null;
  
  const firstError = zodResult.error.errors[0];
  return new ApiError(API_ERROR_CODES.VALIDATION_ERROR, {
    field: firstError.path.join('.'),
    message: firstError.message,
    details: zodResult.error.errors
  });
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const formattedError = formatApiError(error, context);
      throw new ApiError(formattedError.error.code, {
        message: formattedError.error.message,
        field: formattedError.error.field
      });
    }
  };
}

export default {
  API_ERROR_CODES,
  ERROR_CATEGORIES,
  ApiError,
  formatApiError,
  logError,
  createValidationError,
  withErrorHandling
};
