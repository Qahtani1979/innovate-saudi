import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch ministries
 * @param {Object} [options={}]
 * @param {boolean} [options.includeInactive=false]
 */
export function useMinistries(options = { includeInactive: false }) {
    const { includeInactive = false } = options;

    return useQuery({
        queryKey: ['ministries', { includeInactive }],
        queryFn: async () => {
            let query = supabase
                .from('ministries')
                .select('*')
                .eq('is_deleted', false)
                .order('name_en');

            if (!includeInactive) {
                query = query.eq('is_active', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

/**
 * Hook to fetch a single ministry by ID
 * @param {string} id 
 */
export function useMinistry(id) {
    return useQuery({
        queryKey: ['ministry', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('ministries')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}

export default useMinistries;

