import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch competitors (solutions) based on sector
 */
export function useCompetitors(solutionId, sectors = []) {
    return useQuery({
        queryKey: ['competitors', solutionId, sectors],
        queryFn: async () => {
            // If no sectors provided, just fetch top solutions as generic "market context"
            let query = supabase
                .from('solutions')
                .select('id, name_en, metrics, logo_url')
                .neq('id', solutionId || '00000000-0000-0000-0000-000000000000') // Exclude current solution
                .eq('is_published', true)
                .limit(5);

            if (sectors.length > 0) {
                query = query.overlaps('sectors', sectors);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: true, // Always allow fetching, handle params inside
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook to fetch sector demand (recent challenges)
 */
export function useSectorDemand(sectors = []) {
    return useQuery({
        queryKey: ['sector-demand', sectors],
        queryFn: async () => {
            let query = supabase
                .from('challenges')
                .select('id, title_en, created_at, status')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .limit(5);

            if (sectors.length > 0) {
                // Assuming challenges have a 'sectors' column or similar. 
                // If not, we might need to adjust based on schema.
                // Checking standard schema: challenges usually have 'sectors' array.
                query = query.overlaps('sectors', sectors);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5
    });
}
