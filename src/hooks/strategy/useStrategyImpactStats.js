import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStrategyImpactStats(strategicPlanId) {
    return useQuery({
        queryKey: ['strategy-impact-stats', strategicPlanId],
        queryFn: async () => {
            if (!strategicPlanId) return { challenges: 0, pilots: 0, partnerships: 0 };

            const [challengesRes, pilotsRes, partnershipsRes] = await Promise.all([
                supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('is_deleted', false).contains('strategic_plan_ids', [strategicPlanId]),
                supabase.from('pilots').select('id', { count: 'exact', head: true }).eq('is_deleted', false).contains('strategic_plan_ids', [strategicPlanId]),
                supabase.from('partnerships').select('id', { count: 'exact', head: true }).eq('is_deleted', false).contains('strategic_plan_ids', [strategicPlanId])
            ]);

            return {
                challenges: challengesRes.count || 0,
                pilots: pilotsRes.count || 0,
                partnerships: partnershipsRes.count || 0
            };
        },
        enabled: !!strategicPlanId,
        staleTime: 1000 * 60 * 10 // 10 minutes caching for stats
    });
}
