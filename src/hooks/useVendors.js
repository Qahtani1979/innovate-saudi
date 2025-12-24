import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching vendors list
 */
/**
 * Hook for fetching vendors list
 */
export function useVendors(options = {}) {
    const { category, status, page = 1, pageSize = 20 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    return useQuery({
        queryKey: ['vendors', { category, status, page, pageSize }],
        queryFn: async () => {
            let query = supabase
                .from('vendors')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            // Apply visibility rules
            query = applyVisibilityRules(query, 'vendor');

            // Apply filters
            if (category) {
                query = query.eq('category', category);
            }
            if (status) {
                query = query.eq('status', status);
            }

            const { data, count, error } = await query;
            if (error) throw error;
            return { data: data || [], count: count || 0 };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        keepPreviousData: true,
    });
}

/**
 * Hook for fetching single vendor
 */
export function useVendor(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['vendor', id],
        queryFn: async () => {
            let query = supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'vendor');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for fetching vendors by category
 */
export function useVendorsByCategory(category) {
    return useVendors({ category });
}

export default useVendors;
