import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch activity logs for a matchmaker application
 */
export function useMatchmakerActivities(applicationId) {
    return useQuery({
        queryKey: ['matchmaker-activities', applicationId],
        queryFn: async () => {
            if (!applicationId) return [];
            const { data, error } = await supabase
                .from('matchmaker_activity_logs')
                .select('*')
                .eq('application_id', applicationId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data || [];
        },
        enabled: !!applicationId
    });
}

/**
 * Hook to fetch expert evaluations for an entity (application)
 */
export function useExpertEvaluations(entityId) {
    return useQuery({
        queryKey: ['matchmaker-evaluations', entityId],
        queryFn: async () => {
            if (!entityId) return [];
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!entityId
    });
}

