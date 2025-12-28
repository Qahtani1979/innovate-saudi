import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch failed matches for AI analysis
 */
export function useFailedMatches() {
    return useQuery({
        queryKey: ['failed-matches'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matchmaker_applications')
                .select('*')
                .in('stage', ['rejected', 'on_hold']);

            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch matches for a specific provider for portfolio analysis
 */
export function useProviderMatches(providerId) {
    return useQuery({
        queryKey: ['provider-matches', providerId],
        queryFn: async () => {
            if (!providerId) return [];
            const { data, error } = await supabase
                .from('matchmaker_applications')
                .select('*')
                .eq('organization_id', providerId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!providerId,
        initialData: []
    });
}

/**
 * Hook to fetch stalled matches
 * Stalled defined as pending/accepted status with no updates for 14 days
 */
export function useStalledMatches() {
    return useQuery({
        queryKey: ['stalled-matches'],
        queryFn: async () => {
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            const { data, error } = await supabase
                .from('challenge_solution_matches')
                .select(`
                    *,
                    matchmaker_applications(organization_name_en, organization_name_ar),
                    challenges(title_en)
                `)
                .in('status', ['pending', 'accepted'])
                .lt('updated_at', twoWeeksAgo.toISOString());

            if (error) throw error;
            return data || [];
        },
        initialData: []
    });
}

