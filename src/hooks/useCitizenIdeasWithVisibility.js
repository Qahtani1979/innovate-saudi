import { useQuery } from '@tanstack/react-query';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

export function useCitizenIdeasWithVisibility(options = {}) {
    const { municipalityId, status, limit = 100 } = options;
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    return useQuery({
        queryKey: ['citizen-ideas-visibility', { municipalityId, status, limit }],
        queryFn: async () => {
            const filters = {};
            if (municipalityId) filters.municipality_id = municipalityId;
            if (status && status !== 'all') filters.status = status;

            return fetchWithVisibility('citizen_ideas', '*', {
                additionalFilters: filters,
                noVisibilityLimit: options.noVisibilityLimit, // If needed for admin dashboards to bypass
            });
        },
        enabled: !isVisibilityLoading
    });
}
