/**
 * Simple client-side rate limiter
 * For production, use server-side rate limiting
 */

const rateLimitStore = new Map();

/**
 * Check if a request is allowed based on rate limits
 * @param {string} identifier - Unique identifier (e.g., user email, IP)
 * @param {number} maxRequests - Maximum requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, retryAfter?: number }}
 */
export const checkRateLimit = (identifier, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  // Filter out old requests
  const requests = rateLimitStore.get(identifier).filter(t => t > windowStart);
  
  if (requests.length >= maxRequests) {
    const oldestRequest = requests[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Add current request
  requests.push(now);
  rateLimitStore.set(identifier, requests);
  
  return { allowed: true };
};

/**
 * Rate limiter for specific pilot operations
 */
export const pilotRateLimits = {
  create: { maxRequests: 10, windowMs: 60000 },    // 10 per minute
  update: { maxRequests: 30, windowMs: 60000 },    // 30 per minute
  delete: { maxRequests: 5, windowMs: 60000 },     // 5 per minute
  export: { maxRequests: 5, windowMs: 300000 },    // 5 per 5 minutes
  bulkOperation: { maxRequests: 3, windowMs: 60000 } // 3 per minute
};

/**
 * Check rate limit for a pilot operation
 */
export const checkPilotRateLimit = (operation, identifier) => {
  const limits = pilotRateLimits[operation] || { maxRequests: 100, windowMs: 60000 };
  const key = `pilot_${operation}_${identifier}`;
  return checkRateLimit(key, limits.maxRequests, limits.windowMs);
};

/**
 * Clear rate limits for an identifier (e.g., after logout)
 */
export const clearRateLimits = (identifier) => {
  for (const [key] of rateLimitStore) {
    if (key.includes(identifier)) {
      rateLimitStore.delete(key);
    }
  }
};

export default {
  checkRateLimit,
  checkPilotRateLimit,
  clearRateLimits,
  pilotRateLimits
};
