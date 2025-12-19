/**
 * Rate Limiter Hook
 * Client-side rate limiting for API calls
 * Addresses: api-5 (Rate limiting on endpoints)
 */

import { useState, useCallback, useRef } from 'react';

// In-memory rate limit store
const rateLimitStore = new Map();

/**
 * Check if action is rate limited
 * @param {string} key - Unique identifier for the rate limit (e.g., 'challenges-export')
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - { allowed, remaining, resetAt }
 */
export const checkRateLimit = (key, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { 
      allowed: true, 
      remaining: maxRequests - 1, 
      resetAt: new Date(now + windowMs) 
    };
  }

  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetAt: new Date(record.resetAt),
      waitTime: record.resetAt - now
    };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetAt: new Date(record.resetAt) 
  };
};

/**
 * Reset rate limit for a key
 */
export const resetRateLimit = (key) => {
  rateLimitStore.delete(key);
};

/**
 * React hook for rate limiting
 */
export const useRateLimiter = (defaultKey, maxRequests = 10, windowMs = 60000) => {
  const [isLimited, setIsLimited] = useState(false);
  const [remaining, setRemaining] = useState(maxRequests);
  const [resetAt, setResetAt] = useState(null);
  const timeoutRef = useRef(null);

  const checkLimit = useCallback((customKey = null) => {
    const key = customKey || defaultKey;
    const result = checkRateLimit(key, maxRequests, windowMs);
    
    setIsLimited(!result.allowed);
    setRemaining(result.remaining);
    setResetAt(result.resetAt);

    // Auto-reset state when window expires
    if (!result.allowed && result.waitTime) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsLimited(false);
        setRemaining(maxRequests);
        setResetAt(null);
      }, result.waitTime);
    }

    return result;
  }, [defaultKey, maxRequests, windowMs]);

  const reset = useCallback((customKey = null) => {
    const key = customKey || defaultKey;
    resetRateLimit(key);
    setIsLimited(false);
    setRemaining(maxRequests);
    setResetAt(null);
  }, [defaultKey, maxRequests]);

  /**
   * Execute function with rate limit check
   */
  const withRateLimit = useCallback(async (fn, customKey = null) => {
    const result = checkLimit(customKey);
    
    if (!result.allowed) {
      const waitSeconds = Math.ceil(result.waitTime / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds.`);
    }

    return fn();
  }, [checkLimit]);

  return {
    isLimited,
    remaining,
    resetAt,
    checkLimit,
    reset,
    withRateLimit
  };
};

// Rate limit configurations for different operations
export const RATE_LIMITS = {
  // Challenge operations
  CHALLENGE_CREATE: { key: 'challenge-create', max: 10, window: 60000 },
  CHALLENGE_EXPORT: { key: 'challenge-export', max: 5, window: 300000 },
  CHALLENGE_BULK: { key: 'challenge-bulk', max: 3, window: 60000 },
  
  // General exports
  DATA_EXPORT: { key: 'data-export', max: 10, window: 300000 },
  PDF_EXPORT: { key: 'pdf-export', max: 5, window: 60000 },
  
  // API calls
  AI_ANALYSIS: { key: 'ai-analysis', max: 20, window: 60000 },
  SEARCH: { key: 'search', max: 30, window: 60000 },
  
  // Auth operations
  LOGIN_ATTEMPT: { key: 'login-attempt', max: 5, window: 300000 },
  PASSWORD_RESET: { key: 'password-reset', max: 3, window: 3600000 }
};

export default useRateLimiter;
