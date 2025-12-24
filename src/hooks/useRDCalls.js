import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRDCalls(options = {}) {
    const { status, limit } = options;

    return useQuery({
        queryKey: ['rd-calls', status, limit],
        queryFn: async () => {
            let query = supabase
                .from('rd_calls')
                .select('*')
                .eq('is_deleted', false);

            if (status) {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
