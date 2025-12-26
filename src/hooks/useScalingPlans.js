import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching scaling plans
 */
export function useScalingPlans(options = {}) {
    const { pilotId, solutionId, status, limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['scaling-plans', { pilotId, solutionId, status, limit }],
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
            if (solutionId) {
                query = query.eq('validated_solution_id', solutionId);
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
 * Hook for fetching scaling expert sign-offs
 */
export function useScalingExpertSignOffs(planId) {
    return useQuery({
        queryKey: ['scaling-expert-signoffs', planId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', 'scaling_plan')
                .eq('entity_id', planId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!planId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useScalingReadiness() {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['scaling-readiness'],
        queryFn: async () => {
            let query = supabase
                .from('scaling_readiness')
                .select('*');

            query = applyVisibilityRules(query, 'scaling_readiness');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for fetching scaling plans by pilot
 */
export function useScalingPlansByPilot(pilotId) {
    return useScalingPlans({ pilotId });
}

export default useScalingPlans;

/**
 * Hook for fetching scaling deployments
 */
export function useScalingDeployments(planId) {
    return useQuery({
        queryKey: ['scaling-deployments', planId],
        queryFn: async () => {
            if (!planId) return [];
            const { data, error } = await supabase
                .from('scaling_deployments')
                .select(`
                    *,
                    municipality:municipalities(name_en, name_ar)
                `)
                .eq('plan_id', planId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!planId,
        staleTime: 1000 * 60 * 5,
    });
}
