/**
 * Fetch wrapper with retry logic and timeout handling
 */

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_BACKOFF_MS = 1000;

/**
 * Execute a function with retry logic
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @returns {Promise<any>}
 */
export const fetchWithRetry = async (fn, options = {}) => {
  const {
    retries = DEFAULT_RETRIES,
    timeout = DEFAULT_TIMEOUT,
    backoffMs = DEFAULT_BACKOFF_MS,
    onRetry = null,
    shouldRetry = (error) => true
  } = options;

  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const result = await fn({ signal: controller.signal, attempt });
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const isLastAttempt = attempt === retries - 1;
      const isAbortError = error.name === 'AbortError';
      
      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }

      // Calculate backoff delay
      const delay = backoffMs * Math.pow(2, attempt);
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry({ error, attempt, delay, isAbortError });
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Wrapper for Supabase queries with retry
 */
export const supabaseWithRetry = async (queryFn, options = {}) => {
  return fetchWithRetry(async () => {
    const result = await queryFn();
    if (result.error) {
      throw result.error;
    }
    return result;
  }, {
    ...options,
    shouldRetry: (error) => {
      // Retry on network errors or server errors (5xx)
      const isNetworkError = error.message?.includes('network') || 
                             error.message?.includes('fetch');
      const isServerError = error.code >= 500;
      return isNetworkError || isServerError;
    }
  });
};

/**
 * Track API performance
 */
export const trackApiPerformance = (endpoint, startTime, success, metadata = {}) => {
  const duration = Date.now() - startTime;
  
  // Log slow requests
  if (duration > 500) {
    console.warn(`[SLOW API] ${endpoint}: ${duration}ms`, metadata);
  }

  // Log to console for debugging
  console.log(`[API] ${endpoint}: ${duration}ms - ${success ? 'OK' : 'FAIL'}`, metadata);
  
  return { duration, success };
};

export default {
  fetchWithRetry,
  supabaseWithRetry,
  trackApiPerformance
};
