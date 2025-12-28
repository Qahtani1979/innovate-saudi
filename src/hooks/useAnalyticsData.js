import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useAnalyticsData() {

    const useTrendsData = () => {
        return useQuery({
            queryKey: ['trends-data'],
            queryFn: async () => {
                const [
                    { data: trends },
                    { data: globalTrends }
                ] = await Promise.all([
                    supabase.from('trend_entries').select('*').order('created_at', { ascending: false }),
                    supabase.from('global_trends').select('*').order('created_at', { ascending: false })
                ]);
                return {
                    trends: trends || [],
                    globalTrends: globalTrends || []
                };
            },
            staleTime: 1000 * 60 * 10
        });
    };

    const useInnovationPipelineData = () => {
        return useQuery({
            queryKey: ['innovation-pipeline-data'],
            queryFn: async () => {
                const [
                    { data: challenges },
                    { data: pilots },
                    { data: solutions }
                ] = await Promise.all([
                    supabase.from('challenges').select('id, created_at, status').eq('is_deleted', false),
                    supabase.from('pilots').select('id, created_at, stage').eq('is_deleted', false),
                    supabase.from('solutions').select('id, created_at, status').eq('is_deleted', false)
                ]);
                return {
                    challenges: challenges || [],
                    pilots: pilots || [],
                    solutions: solutions || []
                };
            },
            staleTime: 1000 * 60 * 5
        });
    };

    return {
        useTrendsData,
        useInnovationPipelineData
    };
}

