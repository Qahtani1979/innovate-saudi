import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeActivities(options = {}) {
    const { challengeId, challengeIds, limit = 20 } = options;
    const targetIds = challengeId ? [challengeId] : challengeIds;

    return useQuery({
        queryKey: ['challenge-activities', targetIds],
        queryFn: async () => {
            if (!targetIds || targetIds.length === 0) return [];

            let query = supabase.from('challenge_activities').select('*');

            if (challengeId) {
                query = query.eq('challenge_id', challengeId);
            } else {
                query = query.in('challenge_id', targetIds);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        enabled: !!targetIds && targetIds.length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

