import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch high-level matchmaker statistics for executive dashboards.
 */
export function useMatchmakerStats() {
    return useQuery({
        queryKey: ['matchmaker-exec-stats'],
        queryFn: async () => {
            const { data: apps } = await supabase.from('matchmaker_applications').select('stage, classification');
            const { count: pilots } = await supabase.from('pilots').select('*', { count: 'exact', head: true });
            const { count: partnerships } = await supabase.from('organization_partnerships').select('*', { count: 'exact', head: true });

            const active = apps?.filter(a => ['matching', 'engagement', 'pilot_conversion'].includes(a.stage)).length || 0;
            const total = apps?.length || 0;

            return { active, total, pilots: pilots || 0, partnerships: partnerships || 0 };
        },
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });
}

