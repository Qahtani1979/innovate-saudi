import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch R&D Projects
 * @param {Object} options - Options for filtering
 */
export function useRDProjects(options = {}) {
    return useQuery({
        queryKey: ['rd-projects'],
        queryFn: async () => {
            let query = supabase
                .from('rd_projects')
                .select('*')
                .eq('is_deleted', false);

            if (options.living_lab_id) {
                if (Array.isArray(options.living_lab_id)) {
                    query = query.in('living_lab_id', options.living_lab_id);
                } else {
                    query = query.eq('living_lab_id', options.living_lab_id);
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}
