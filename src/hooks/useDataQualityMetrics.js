/**
 * Hook for Data Quality Metrics
 * Fetches data for the AI Data Quality Dashboard.
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useDataQualityMetrics() {

    // Fetch all challenges for completeness analysis
    const { data: challenges = [] } = useQuery({
        queryKey: ['challenges-quality'],
        queryFn: async () => {
            const { data, error } = await supabase.from('challenges').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 15 // 15 minutes
    });

    // Fetch all pilots
    const { data: pilots = [] } = useQuery({
        queryKey: ['pilots-quality'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 15
    });

    // Fetch all solutions
    const { data: solutions = [] } = useQuery({
        queryKey: ['solutions-quality'],
        queryFn: async () => {
            const { data, error } = await supabase.from('solutions').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 15
    });

    return {
        challenges,
        pilots,
        solutions
    };
}

