import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProgressReportData() {
    // Fetch challenges
    const { data: challenges = [], isLoading: challengesLoading } = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*');
            if (error) throw error;
            return data;
        }
    });

    // Fetch pilots
    const { data: pilots = [], isLoading: pilotsLoading } = useQuery({
        queryKey: ['pilots'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*');
            if (error) throw error;
            return data;
        }
    });

    // Fetch solutions
    const { data: solutions = [], isLoading: solutionsLoading } = useQuery({
        queryKey: ['solutions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solutions')
                .select('*');
            if (error) throw error;
            return data;
        }
    });

    return {
        challenges,
        pilots,
        solutions,
        isLoading: challengesLoading || pilotsLoading || solutionsLoading
    };
}
