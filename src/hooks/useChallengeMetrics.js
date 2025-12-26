import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeMetrics(challengeId) {
    const solutionsCount = useQuery({
        queryKey: ['challenge-solutions-count', challengeId],
        queryFn: async () => {
            if (!challengeId) return 0;
            // @ts-ignore
            const { count, error } = await supabase
                .from('solutions')
                .select('*', { count: 'exact', head: true })
                .eq('challenge_id', challengeId)
                .eq('is_deleted', false);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!challengeId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const pilotsCount = useQuery({
        queryKey: ['challenge-pilots-count', challengeId],
        queryFn: async () => {
            if (!challengeId) return 0;
            const { count, error } = await supabase
                .from('pilots')
                .select('*', { count: 'exact', head: true })
                .eq('challenge_id', challengeId)
                .eq('is_deleted', false);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!challengeId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        solutionsCount: solutionsCount.data || 0,
        pilotsCount: pilotsCount.data || 0,
        isLoading: solutionsCount.isLoading || pilotsCount.isLoading,
        error: solutionsCount.error || pilotsCount.error
    };
}
