import { useQuery } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

export function usePilot(pilotId) {
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    return useQuery({
        queryKey: ['pilot', pilotId],
        queryFn: async () => {
            if (!pilotId) return null;
            // Use centralized visibility fetch
            // Pass the ID as a filter. Since fetchWithVisibility returns an array, we take the first item.
            const data = await fetchWithVisibility('pilots', '*', {
                additionalFilters: { id: pilotId }
            });
            return data?.[0] || null;
        },
        enabled: !!pilotId && !isVisibilityLoading
    });
}

