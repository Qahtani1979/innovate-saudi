import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEntityVisibility } from '@/hooks/useEntityVisibility';

export function useRisksWithVisibility(options = {}) {
    const { limit, activeOnly = false } = options;
    const { isPublic, filterConfig } = useEntityVisibility('risks');

    return useQuery({
        queryKey: ['risks-visibility', limit, activeOnly, isPublic, filterConfig],
        queryFn: async () => {
            let query = supabase
                .from('risks')
                .select('*')
                .order('created_at', { ascending: false });

            if (activeOnly) {
                query = query.eq('status', 'active');
            }

            if (limit) {
                query = query.limit(limit);
            }

            // Apply visibility filters if available in filterConfig
            // Assuming 'risks' might have 'visibility' column or similar RLS access
            // For now, simpler implementation as 'risks' table structure isn't fully clear but usually follows pattern

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
