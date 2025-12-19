/**
 * Input Sanitizer
 * Implements: api-4 (request sanitization), sec-6 (sensitive data protection)
 */

// Characters that could be used in injection attacks
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /javascript:/gi, // JavaScript protocol
  /on\w+\s*=/gi, // Event handlers
  /data:/gi, // Data URLs
  /vbscript:/gi, // VBScript
  /<iframe/gi, // iframes
  /<object/gi, // objects
  /<embed/gi, // embeds
  /expression\s*\(/gi, // CSS expressions
  /url\s*\(/gi, // CSS url()
];

// SQL injection patterns (for logging/detection)
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
  /(--)|(\/\*)|(\*\/)/g, // SQL comments
  /(;|\||&&)/g, // Command separators
];

/**
 * Sanitize a string by removing dangerous characters and patterns
 */
export function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }
  
  const {
    maxLength = 10000,
    allowHtml = false,
    trimWhitespace = true,
    removeNullBytes = true
  } = options;
  
  let sanitized = input;
  
  // Remove null bytes
  if (removeNullBytes) {
    sanitized = sanitized.replace(/\0/g, '');
  }
  
  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove dangerous patterns if HTML not allowed
  if (!allowHtml) {
    DANGEROUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Escape HTML entities
    sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char]);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  // Remove whitespace and convert to lowercase
  let sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  // Remove any dangerous characters
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  return sanitized;
}

/**
 * Sanitize UUID
 */
export function sanitizeUuid(uuid) {
  if (typeof uuid !== 'string') return null;
  
  const sanitized = uuid.trim().toLowerCase();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  
  return uuidRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize integer
 */
export function sanitizeInteger(value, options = {}) {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, defaultValue = 0 } = options;
  
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject(obj, options = {}) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key name
    const sanitizedKey = sanitizeString(key, { maxLength: 100 });
    
    // Skip potentially dangerous keys
    if (sanitizedKey.startsWith('__') || sanitizedKey === 'constructor' || sanitizedKey === 'prototype') {
      continue;
    }
    
    sanitized[sanitizedKey] = sanitizeObject(value, options);
  }
  
  return sanitized;
}

/**
 * Detect potential injection attempts (for logging)
 */
export function detectInjectionAttempt(input) {
  if (typeof input !== 'string') return false;
  
  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { type: 'sql', pattern: pattern.toString() };
    }
  }
  
  // Check for XSS patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return { type: 'xss', pattern: pattern.toString() };
    }
  }
  
  return false;
}

/**
 * Sanitize challenge data specifically
 */
export function sanitizeChallengeData(data) {
  const sanitized = {};
  
  // Title fields - strict sanitization
  if (data.title_en) {
    sanitized.title_en = sanitizeString(data.title_en, { maxLength: 200 });
  }
  if (data.title_ar) {
    sanitized.title_ar = sanitizeString(data.title_ar, { maxLength: 200 });
  }
  
  // Description fields - allow more length
  if (data.description_en) {
    sanitized.description_en = sanitizeString(data.description_en, { maxLength: 5000 });
  }
  if (data.description_ar) {
    sanitized.description_ar = sanitizeString(data.description_ar, { maxLength: 5000 });
  }
  
  // Text fields
  const textFields = [
    'problem_statement_en', 'problem_statement_ar',
    'current_situation_en', 'current_situation_ar',
    'desired_outcome_en', 'desired_outcome_ar',
    'root_cause_en', 'root_cause_ar',
    'tagline_en', 'tagline_ar'
  ];
  
  textFields.forEach(field => {
    if (data[field]) {
      sanitized[field] = sanitizeString(data[field], { maxLength: 2000 });
    }
  });
  
  // UUID fields
  const uuidFields = ['municipality_id', 'sector_id', 'region_id', 'city_id', 'service_id', 'subsector_id'];
  uuidFields.forEach(field => {
    if (data[field]) {
      const sanitizedUuid = sanitizeUuid(data[field]);
      if (sanitizedUuid) {
        sanitized[field] = sanitizedUuid;
      }
    }
  });
  
  // Email fields
  if (data.challenge_owner_email) {
    sanitized.challenge_owner_email = sanitizeEmail(data.challenge_owner_email);
  }
  if (data.review_assigned_to) {
    sanitized.review_assigned_to = sanitizeEmail(data.review_assigned_to);
  }
  
  // Enum fields (strict whitelist)
  const validStatuses = ['draft', 'submitted', 'processing', 'under_review', 'approved', 'rejected', 'published', 'resolved', 'archived'];
  if (data.status && validStatuses.includes(data.status)) {
    sanitized.status = data.status;
  }
  
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (data.priority && validPriorities.includes(data.priority)) {
    sanitized.priority = data.priority;
  }
  
  // Boolean fields
  const booleanFields = ['is_published', 'is_featured', 'is_confidential', 'is_deleted', 'is_archived'];
  booleanFields.forEach(field => {
    if (typeof data[field] === 'boolean') {
      sanitized[field] = data[field];
    }
  });
  
  // Number fields
  if (data.budget_estimate !== undefined) {
    sanitized.budget_estimate = sanitizeInteger(data.budget_estimate, { min: 0, max: 1000000000 });
  }
  if (data.affected_population_size !== undefined) {
    sanitized.affected_population_size = sanitizeInteger(data.affected_population_size, { min: 0 });
  }
  
  // Array fields - sanitize each item
  const arrayFields = ['tags', 'keywords', 'root_causes', 'affected_services', 'tracks'];
  arrayFields.forEach(field => {
    if (Array.isArray(data[field])) {
      sanitized[field] = data[field]
        .filter(item => typeof item === 'string')
        .map(item => sanitizeString(item, { maxLength: 100 }))
        .slice(0, 50); // Max 50 items
    }
  });
  
  return sanitized;
}

/**
 * Mask sensitive data for display
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return '***';
  
  const maskedLocal = localPart.length > 2 
    ? localPart.substring(0, 2) + '***' 
    : '***';
  
  return `${maskedLocal}@${domain}`;
}

export function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  
  return '***' + digits.slice(-4);
}

/**
 * Create a sanitization middleware for API requests
 */
export function createSanitizationMiddleware(options = {}) {
  return (data) => {
    // Log potential injection attempts
    const injection = detectInjectionAttempt(JSON.stringify(data));
    if (injection) {
      console.warn('[Security] Potential injection attempt detected:', injection);
    }
    
    return sanitizeObject(data, options);
  };
}

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizeUuid,
  sanitizeInteger,
  sanitizeObject,
  sanitizeChallengeData,
  escapeHtml,
  detectInjectionAttempt,
  maskEmail,
  maskPhoneNumber,
  createSanitizationMiddleware
};
