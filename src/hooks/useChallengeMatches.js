import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeMatches(options = {}) {
    const { challengeIds, status = 'pending', minScore = 70, limit = 5 } = options;

    return useQuery({
        queryKey: ['challenge-matches', challengeIds, status, minScore],
        queryFn: async () => {
            if (!challengeIds || challengeIds.length === 0) return [];

            const { data, error } = await supabase
                .from('challenge_solution_matches')
                .select('*')
                .in('challenge_id', challengeIds)
                .eq('status', status)
                .gte('match_score', minScore)
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        enabled: !!challengeIds && challengeIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });
}

export function useChallengeMatchingMutations() {
    const queryClient = useQueryClient(); // Ensure imported likely needs update if not imported

    const createMatch = useMutation({
        /** @param {any} data */
        mutationFn: async (data) => {
            const { error } = await supabase.from('challenge_solution_matches').insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate matches query (assuming it uses 'matches' or similar key)
            // The main hook uses 'challenge-matches'.
            queryClient.invalidateQueries({ queryKey: ['challenge-matches'] });
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
    });

    const createNotification = useMutation({
        /** @param {any} data */
        mutationFn: async (data) => {
            const { error } = await supabase.from('notifications').insert([data]);
            if (error) throw error;
        }
    });

    const semanticSearch = useMutation({
        /** @param {{ challengeId: string, limit?: number }} params */
        mutationFn: async (params) => {
            const { challengeId, limit = 10 } = params;
            const { data, error } = await supabase.functions.invoke('semanticSearch', {
                body: { challenge_id: challengeId, limit }
            });
            if (error) throw error;
            return data || [];
        }
    });

    return { createMatch, createNotification, semanticSearch };
}
