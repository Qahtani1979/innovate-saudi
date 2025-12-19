/**
 * API Response Formatter
 * Implements: api-10 (graceful degradation), api-12 (pagination), api-13 (caching)
 */

import { API_ERROR_CODES, formatApiError } from './errorHandler';

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Format successful API response
 */
export function formatSuccessResponse(data, options = {}) {
  const {
    message = null,
    metadata = {},
    pagination = null
  } = options;
  
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    response.message = message;
  }
  
  if (pagination) {
    response.pagination = pagination;
  }
  
  if (Object.keys(metadata).length > 0) {
    response.metadata = metadata;
  }
  
  return response;
}

/**
 * Format paginated response
 */
export function formatPaginatedResponse(items, options = {}) {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    total = items.length,
    hasMore = false
  } = options;
  
  return formatSuccessResponse(items, {
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore,
      hasPrevious: page > 1
    }
  });
}

/**
 * Calculate pagination parameters
 */
export function calculatePagination(options = {}) {
  let { page = 1, pageSize = DEFAULT_PAGE_SIZE, limit, offset } = options;
  
  // Convert limit/offset to page/pageSize if provided
  if (limit !== undefined && offset !== undefined) {
    pageSize = Math.min(limit, MAX_PAGE_SIZE);
    page = Math.floor(offset / pageSize) + 1;
  }
  
  // Ensure valid values
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE));
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  return {
    page,
    pageSize,
    from,
    to,
    limit: pageSize,
    offset: from
  };
}

/**
 * Create cache key for query
 */
export function createCacheKey(baseKey, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {});
  
  return `${baseKey}:${JSON.stringify(sortedParams)}`;
}

/**
 * React Query options with smart caching
 */
export function createQueryOptions(options = {}) {
  const {
    cacheTime = DEFAULT_CACHE_TIME,
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    retry = 2,
    retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  } = options;
  
  return {
    staleTime,
    gcTime: cacheTime, // React Query v5 uses gcTime instead of cacheTime
    refetchOnWindowFocus,
    refetchOnMount,
    retry,
    retryDelay
  };
}

/**
 * Graceful degradation wrapper (api-10)
 */
export async function withGracefulDegradation(primaryFn, fallbackFn, options = {}) {
  const { timeout = 10000, retries = 1 } = options;
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });
      
      // Race between primary function and timeout
      const result = await Promise.race([primaryFn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;
      
      // If this is the last attempt, try fallback
      if (attempt === retries && fallbackFn) {
        try {
          console.warn('[Graceful Degradation] Primary failed, using fallback:', error.message);
          return await fallbackFn();
        } catch (fallbackError) {
          console.error('[Graceful Degradation] Fallback also failed:', fallbackError.message);
          throw lastError;
        }
      }
      
      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Format list query parameters
 */
export function formatQueryParams(params = {}) {
  const {
    search,
    status,
    priority,
    municipalityId,
    sectorId,
    isPublished,
    sortBy = 'created_at',
    sortOrder = 'desc',
    ...pagination
  } = params;
  
  const filters = {};
  
  if (search?.trim()) {
    filters.search = search.trim();
  }
  
  if (status) {
    filters.status = Array.isArray(status) ? status : [status];
  }
  
  if (priority) {
    filters.priority = Array.isArray(priority) ? priority : [priority];
  }
  
  if (municipalityId) {
    filters.municipality_id = municipalityId;
  }
  
  if (sectorId) {
    filters.sector_id = sectorId;
  }
  
  if (typeof isPublished === 'boolean') {
    filters.is_published = isPublished;
  }
  
  const sort = {
    column: sortBy,
    ascending: sortOrder === 'asc'
  };
  
  return {
    filters,
    sort,
    pagination: calculatePagination(pagination)
  };
}

/**
 * Apply query parameters to Supabase query
 */
export function applyQueryParams(query, params) {
  const { filters, sort, pagination } = formatQueryParams(params);
  
  let modifiedQuery = query;
  
  // Apply filters
  if (filters.status?.length) {
    modifiedQuery = modifiedQuery.in('status', filters.status);
  }
  
  if (filters.priority?.length) {
    modifiedQuery = modifiedQuery.in('priority', filters.priority);
  }
  
  if (filters.municipality_id) {
    modifiedQuery = modifiedQuery.eq('municipality_id', filters.municipality_id);
  }
  
  if (filters.sector_id) {
    modifiedQuery = modifiedQuery.eq('sector_id', filters.sector_id);
  }
  
  if (typeof filters.is_published === 'boolean') {
    modifiedQuery = modifiedQuery.eq('is_published', filters.is_published);
  }
  
  if (filters.search) {
    modifiedQuery = modifiedQuery.or(
      `title_en.ilike.%${filters.search}%,title_ar.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`
    );
  }
  
  // Apply sorting
  modifiedQuery = modifiedQuery.order(sort.column, { ascending: sort.ascending });
  
  // Apply pagination
  modifiedQuery = modifiedQuery.range(pagination.from, pagination.to);
  
  return modifiedQuery;
}

/**
 * Create optimized select clause (api-14)
 */
export function createSelectClause(fields = [], relations = []) {
  const baseFields = fields.length > 0 ? fields : ['*'];
  const relationClauses = relations.map(rel => {
    if (typeof rel === 'string') {
      return rel;
    }
    return `${rel.table}:${rel.foreignKey}(${rel.fields.join(',')})`;
  });
  
  return [...baseFields, ...relationClauses].join(',');
}

/**
 * Commonly used select clauses for challenges
 */
export const CHALLENGE_SELECT_CLAUSES = {
  // Minimal - for lists
  minimal: `
    id,
    title_en,
    title_ar,
    status,
    priority,
    is_published,
    created_at,
    municipality_id
  `.replace(/\s+/g, ''),
  
  // Summary - for cards
  summary: `
    id,
    title_en,
    title_ar,
    tagline_en,
    tagline_ar,
    description_en,
    status,
    priority,
    category,
    is_published,
    is_featured,
    image_url,
    citizen_votes_count,
    view_count,
    created_at,
    municipality_id,
    sector_id
  `.replace(/\s+/g, ''),
  
  // Full - for detail view
  full: '*',
  
  // With relations
  withRelations: `
    *,
    municipalities:municipality_id(id,name_en,name_ar),
    sectors:sector_id(id,name_en,name_ar)
  `.replace(/\s+/g, '')
};

export default {
  formatSuccessResponse,
  formatPaginatedResponse,
  calculatePagination,
  createCacheKey,
  createQueryOptions,
  withGracefulDegradation,
  formatQueryParams,
  applyQueryParams,
  createSelectClause,
  CHALLENGE_SELECT_CLAUSES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
};
