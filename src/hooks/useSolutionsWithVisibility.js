import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

export function useSolutionsWithVisibility(options = {}) {
  const {
    limit = 100,
    verifiedOnly = false,
    publishedOnly = false,
    // Pagination
    page,
    pageSize,
    paginate = false
  } = options;

  const { fetchWithVisibility, isLoading: visibilityLoading } = useVisibilitySystem();

  return useQuery({
    queryKey: ['solutions-with-visibility', {
      limit,
      verifiedOnly,
      publishedOnly,
      page,
      pageSize,
      paginate
    }],
    queryFn: async () => {
      // Pagination Logic
      let range = null;
      let count = null;
      if (paginate && page && pageSize) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        range = { start: from, end: to };
        count = 'exact';
      }

      // Additional Filters
      const additionalFilters = {};
      if (verifiedOnly) additionalFilters.is_verified = true;
      if (publishedOnly) additionalFilters.is_published = true;

      // Use the centralized visibility fetcher
      const result = await fetchWithVisibility('solutions', '*', {
        limit: paginate ? undefined : limit,
        range,
        count,
        publishedOnly,
        additionalFilters
      });

      if (paginate && count) {
        // @ts-ignore
        const data = result.data || [];
        // @ts-ignore
        const totalCount = result.count || 0;

        return {
          data,
          totalCount,
          totalPages: totalCount ? Math.ceil(totalCount / (pageSize || 10)) : 0
        };
      }

      return result || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: paginate ? keepPreviousData : undefined
  });
}

export function useSolution(solutionId) {
  const { fetchWithVisibility, isLoading: visibilityLoading } = useVisibilitySystem();

  return useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      if (!solutionId) return null;
      // Fetch single entity with visibility check
      const data = await fetchWithVisibility('solutions', '*', {
        additionalFilters: { id: solutionId }
      });
      // fetchWithVisibility returns array
      // @ts-ignore
      return Array.isArray(data) ? data[0] : null;
    },
    enabled: !!solutionId && !visibilityLoading,
    staleTime: 1000 * 60 * 5
  });
}

/**
 * Hook to fetch solutions created by the specified user (usually current user).
 */
export function useMySolutions(email) {
  const { fetchWithVisibility, isLoading: visibilityLoading } = useVisibilitySystem();

  return useQuery({
    queryKey: ['my-solutions', email],
    queryFn: async () => {
      if (!email) return [];

      return fetchWithVisibility('solutions', '*', {
        additionalFilters: { created_by: email },
        includeDeleted: false,
        limit: 1000
      });
    },
    enabled: !!email && !visibilityLoading,
    staleTime: 1000 * 60 * 2 // 2 minutes
  });
}
