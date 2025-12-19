/**
 * API Performance Monitor
 * Implements: api-11 (response time optimization)
 */

// Performance thresholds (ms)
const THRESHOLDS = {
  fast: 200,
  acceptable: 1000,
  slow: 3000
};

// Performance metrics storage
const metricsStore = new Map();

/**
 * Track response time for a query/operation
 */
export function trackResponseTime(queryName, startTime) {
  const duration = Date.now() - startTime;
  
  // Store metric
  if (!metricsStore.has(queryName)) {
    metricsStore.set(queryName, { count: 0, total: 0, max: 0, min: Infinity });
  }
  
  const metric = metricsStore.get(queryName);
  metric.count++;
  metric.total += duration;
  metric.max = Math.max(metric.max, duration);
  metric.min = Math.min(metric.min, duration);
  
  // Log slow queries
  if (duration > THRESHOLDS.slow) {
    console.error(`[SLOW QUERY] ${queryName}: ${duration}ms`);
  } else if (duration > THRESHOLDS.acceptable) {
    console.warn(`[SLOW] ${queryName}: ${duration}ms`);
  }
  
  return {
    duration,
    status: duration <= THRESHOLDS.fast ? 'fast' : 
            duration <= THRESHOLDS.acceptable ? 'acceptable' : 
            duration <= THRESHOLDS.slow ? 'slow' : 'critical'
  };
}

/**
 * Create a performance-tracked async function wrapper
 */
export function withPerformanceTracking(fn, queryName) {
  return async (...args) => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      trackResponseTime(queryName, startTime);
      return result;
    } catch (error) {
      trackResponseTime(`${queryName}_error`, startTime);
      throw error;
    }
  };
}

/**
 * Get performance metrics for a query
 */
export function getMetrics(queryName) {
  const metric = metricsStore.get(queryName);
  if (!metric) return null;
  
  return {
    queryName,
    count: metric.count,
    avgMs: Math.round(metric.total / metric.count),
    maxMs: metric.max,
    minMs: metric.min,
    status: getOverallStatus(metric.total / metric.count)
  };
}

/**
 * Get all performance metrics
 */
export function getAllMetrics() {
  const metrics = [];
  metricsStore.forEach((metric, queryName) => {
    metrics.push(getMetrics(queryName));
  });
  return metrics.sort((a, b) => b.avgMs - a.avgMs);
}

/**
 * Clear metrics (for testing)
 */
export function clearMetrics() {
  metricsStore.clear();
}

function getOverallStatus(avgMs) {
  if (avgMs <= THRESHOLDS.fast) return 'excellent';
  if (avgMs <= THRESHOLDS.acceptable) return 'good';
  if (avgMs <= THRESHOLDS.slow) return 'needs_improvement';
  return 'critical';
}

/**
 * React Query wrapper with performance tracking
 */
export function createTrackedQueryFn(queryFn, queryName) {
  return async (...args) => {
    const startTime = Date.now();
    try {
      const result = await queryFn(...args);
      trackResponseTime(queryName, startTime);
      return result;
    } catch (error) {
      trackResponseTime(`${queryName}_error`, startTime);
      throw error;
    }
  };
}

export default {
  trackResponseTime,
  withPerformanceTracking,
  getMetrics,
  getAllMetrics,
  clearMetrics,
  createTrackedQueryFn,
  THRESHOLDS
};
