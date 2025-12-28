import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching regions
 */
export function useRegions(options = {}) {
    const { limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['regions', { limit }],
        queryFn: async () => {
            let query = supabase
                .from('regions')
                .select('*')
                .order('name_en')
                .limit(limit);

            query = applyVisibilityRules(query, 'region');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes (regions change infrequently)
    });
}

/**
 * Hook for fetching single region
 */
export function useRegion(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['region', id],
        queryFn: async () => {
            let query = supabase
                .from('regions')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'region');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for fetching cities
 */
export function useCities(options = {}) {
    const { regionId, limit = 200 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['cities', { regionId, limit }],
        queryFn: async () => {
            let query = supabase
                .from('cities')
                .select('*')
                .order('name_en')
                .limit(limit);

            query = applyVisibilityRules(query, 'city');

            if (regionId) {
                query = query.eq('region_id', regionId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export default useRegions;

