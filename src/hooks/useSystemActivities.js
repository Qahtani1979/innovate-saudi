import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useSystemActivities(options = {}) {
    const { limit = 50, refetchInterval = 30000 } = options;

    return useQuery({
        queryKey: ['system-activities', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        },
        refetchInterval
    });
}

