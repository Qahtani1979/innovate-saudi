import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching MOUs (Memorandums of Understanding)
 */
export function useMOUs(options = {}) {
    const { status, partnerId, limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['mous', { status, partnerId, limit }],
        queryFn: async () => {
            let query = supabase
                .from('organization_partnerships')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            query = applyVisibilityRules(query, 'partnership');

            if (status) {
                query = query.eq('status', status);
            }
            if (partnerId) {
                query = query.or(`organization1_id.eq.${partnerId},organization2_id.eq.${partnerId}`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching single MOU
 */
export function useMOU(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['mou', id],
        queryFn: async () => {
            let query = supabase
                .from('organization_partnerships')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'partnership');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for fetching active MOUs
 */
export function useActiveMOUs() {
    return useMOUs({ status: 'active' });
}

export default useMOUs;
