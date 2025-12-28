
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch system activities for a specific solution.
 */
export function useSolutionSystemActivities(solutionId) {
    return useQuery({
        queryKey: ['solution-system-activities', solutionId],
        queryFn: async () => {
            if (!solutionId) return [];
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_type', 'Solution')
                .eq('entity_id', solutionId)
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId
    });
}

/**
 * Hook to fetch interests for a specific solution.
 */
export function useSolutionInterests(solutionId) {
    return useQuery({
        queryKey: ['solution-interests-list', solutionId],
        queryFn: async () => {
            if (!solutionId) return [];
            const { data, error } = await supabase
                .from('solution_interests')
                .select('*')
                .eq('solution_id', solutionId)
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId
    });
}

/**
 * Hook to fetch demo requests for a specific solution.
 */
export function useSolutionDemoRequests(solutionId) {
    return useQuery({
        queryKey: ['solution-demo-requests', solutionId],
        queryFn: async () => {
            if (!solutionId) return [];
            const { data, error } = await supabase
                .from('demo_requests')
                .select('*')
                .eq('solution_id', solutionId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId
    });
}

