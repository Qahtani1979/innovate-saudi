import { useQuery } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

export function useCitizenIdeasWithVisibility(options = {}) {
    const { municipalityId, status, limit = 100, orderBy = 'created_at', orderDirection = 'desc' } = options;
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    return useQuery({
        queryKey: ['citizen-ideas-visibility', { municipalityId, status, limit, orderBy, orderDirection }],
        queryFn: async () => {
            const filters = {};
            if (municipalityId) filters.municipality_id = municipalityId;
            if (status && status !== 'all') filters.status = status;

            // Standard public board filter
            // filters.is_published = true; // Column likely doesn't exist

            return fetchWithVisibility('citizen_ideas', '*', {
                additionalFilters: filters,
                noVisibilityLimit: options.noVisibilityLimit,
                orderBy,
                orderDirection,
                deletedColumn: null // Column likely doesn't exist
            });
        },
        enabled: !isVisibilityLoading
    });
}

