import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * useMatchmakerApplications
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useMatchmakerApplications(options = {}) {
    const { limit = 100 } = options;

    return useQuery({
        queryKey: ['matchmaker-applications', { limit }],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matchmaker_applications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}
