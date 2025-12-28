import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching challenge team activity statistics.
 */
export function useChallengeTeamStats(challengeId) {
    return useQuery({
        queryKey: ['challenge-team-stats', challengeId],
        queryFn: async () => {
            if (!challengeId) return { comments: 0, evaluations: 0, activities: 0 };

            const [comments, evaluations, activities] = await Promise.all([
                supabase.from('comments').select('id', { count: 'exact', head: true }).eq('challenge_id', challengeId),
                supabase.from('expert_evaluations').select('id', { count: 'exact', head: true }).eq('challenge_id', challengeId),
                supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('entity_id', challengeId)
            ]);

            return {
                comments: comments.count || 0,
                evaluations: evaluations.count || 0,
                activities: activities.count || 0
            };
        },
        enabled: !!challengeId,
        staleTime: 1000 * 60 * 2 // 2 minutes
    });
}

