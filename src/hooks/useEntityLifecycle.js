import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for Entity Records Lifecycle Tracker
 * Fetches data for dashboard analytics
 */
export function useEntityLifecycle() {

    const useLifecycleData = () => useQuery({
        queryKey: ['entity-lifecycle-data'],
        queryFn: async () => {
            const { data: challenges } = await supabase.from('challenges').select('*');
            const { data: solutions } = await supabase.from('solutions').select('*');
            const { data: pilots } = await supabase.from('pilots').select('*');
            const { data: rdProjects } = await supabase.from('rd_projects').select('*');
            const { data: programs } = await supabase.from('programs').select('*');
            const { data: sandboxes } = await supabase.from('sandboxes').select('*');
            const { data: matchmakerApps } = await supabase.from('matchmaker_applications').select('*');

            return {
                challenges: challenges || [],
                solutions: solutions || [],
                pilots: pilots || [],
                rdProjects: rdProjects || [],
                programs: programs || [],
                sandboxes: sandboxes || [],
                matchmakerApps: matchmakerApps || []
            };
        },
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });

    return {
        useLifecycleData
    };
}

