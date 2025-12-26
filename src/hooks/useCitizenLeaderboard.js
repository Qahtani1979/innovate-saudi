import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch top contributors for the leaderboard
 * @param {{ limit?: number }} options - Query options
 */
export function useCitizenLeaderboard(options = {}) {
    const { limit = 50 } = options;

    return useQuery({
        queryKey: ['citizen-leaderboard', limit],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('citizen_points')
                .select('*')
                .eq('is_active', true)
                .order('total_points', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes (leaderboards are typically cached longer)
    });
}
