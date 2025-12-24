import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching scaling plans
 */
export function useScalingPlans(options = {}) {
    const { pilotId, status, limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['scaling-plans', { pilotId, status, limit }],
        queryFn: async () => {
            let query = supabase
                .from('scaling_plans')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            query = applyVisibilityRules(query, 'scaling_plan');

            if (pilotId) {
                query = query.eq('pilot_id', pilotId);
            }
            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching single scaling plan
 */
export function useScalingPlan(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['scaling-plan', id],
        queryFn: async () => {
            let query = supabase
                .from('scaling_plans')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'scaling_plan');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for fetching scaling plans by pilot
 */
export function useScalingPlansByPilot(pilotId) {
    return useScalingPlans({ pilotId });
}

export default useScalingPlans;
