import { useQuery } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Gold Standard Hook for Server-Side Pagination
 * @param {Object} options Configuration options
 * @param {string} options.entityName Table name to fetch from
 * @param {number} options.page Current page number (1-based)
 * @param {number} options.pageSize Number of items per page
 * @param {Object} options.filters Additional filters to apply
 * @param {string} options.select Columns to select (default: '*')
 * @param {boolean} options.enabled Whether query is enabled
 * @returns {Object} Flattened pagination result
 */
export function useEntityPagination({
    entityName,
    page = 1,
    pageSize = 10,
    filters = {},
    select = '*',
    enabled = true,
    deletedColumn = 'is_deleted'
} = {}) {
    const { fetchWithVisibility } = useVisibilitySystem();

    // 1. QUERY CONFIGURATION
    const query = useQuery({
        // Include page/pageSize/filters/deletedColumn in key for automatic refetching
        queryKey: [entityName, 'paginated', filters, page, pageSize, deletedColumn],

        queryFn: async () => {
            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            // Pass range to visibility fetcher
            // fetchWithVisibility must return { data, count } when count: 'exact' is used
            return fetchWithVisibility(entityName, select, {
                range: { start, end },
                additionalFilters: filters,
                count: 'exact',
                deletedColumn: deletedColumn // Use the passed option (can be null)
            });
        },

        // 2. CACHING STRATEGY (Gold Standard)
        keepPreviousData: true,      // Anti-shimmer: Show old data while fetching new
        staleTime: 5 * 60 * 1000,    // 5 minutes fresh
        cacheTime: 10 * 60 * 1000,   // 10 minutes cache
        refetchOnWindowFocus: false, // Don't refetch lists on focus (UX stability)

        // 3. CONDITIONAL FETCHING
        enabled: enabled && !!entityName
    });

    // 4. FLATTENED RETURN API (DX-First)
    const { data: queryData } = query;
    const data = queryData?.data || [];
    const totalCount = queryData?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        // Data Access
        data,
        totalCount,
        totalPages,
        currentPage: page,

        // Navigation Helpers
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,

        // Loading States
        isLoading: query.isLoading,         // initial load
        isFetching: query.isFetching,       // background refresh
        isError: query.isError,
        error: query.error,
        isEmpty: !query.isLoading && data.length === 0,

        // Actions
        refetch: query.refetch,
    };
}

