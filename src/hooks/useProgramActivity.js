
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch system activities for a specific program.
 */
export function useProgramSystemActivities(programId) {
    return useQuery({
        queryKey: ['program-system-activities', programId],
        queryFn: async () => {
            if (!programId) return [];
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_type', 'program')
                .eq('entity_id', programId)
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });
}

