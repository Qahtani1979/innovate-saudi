import { useQuery } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

export function useCityAnalytics(cityId) {
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    const useCityChallenges = () => useQuery({
        queryKey: ['city-challenges', cityId],
        queryFn: async () => {
            return fetchWithVisibility('challenges', '*', {
                additionalFilters: { city_id: cityId }
            });
        },
        enabled: !!cityId && !isVisibilityLoading
    });

    const useCityPilots = () => useQuery({
        queryKey: ['city-pilots', cityId],
        queryFn: async () => {
            return fetchWithVisibility('pilots', '*', {
                additionalFilters: { city_id: cityId }
            });
        },
        enabled: !!cityId && !isVisibilityLoading
    });

    const useCitySolutions = () => useQuery({
        queryKey: ['city-solutions', cityId],
        queryFn: async () => {
            return fetchWithVisibility('solutions', '*', {
                additionalFilters: { city_id: cityId }
            });
        },
        enabled: !!cityId && !isVisibilityLoading
    });

    return {
        useCityChallenges,
        useCityPilots,
        useCitySolutions,
        isVisibilityLoading
    };
}

