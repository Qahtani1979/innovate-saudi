import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePlatformStatistics() {
    const { data: municipalities = [], isLoading: loadingMunicipalities } = useQuery({
        queryKey: ['municipalities-count'],
        queryFn: async () => {
            const { data } = await supabase.from('municipalities').select('id, created_at');
            return data || [];
        }
    });

    const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
        queryKey: ['challenges-count'],
        queryFn: async () => {
            const { data } = await supabase.from('challenges').select('id, created_at').eq('is_deleted', false);
            return data || [];
        }
    });

    const { data: pilots = [], isLoading: loadingPilots } = useQuery({
        queryKey: ['pilots-count'],
        queryFn: async () => {
            const { data } = await supabase.from('pilots').select('id, created_at').eq('is_deleted', false);
            return data || [];
        }
    });

    const { data: solutions = [], isLoading: loadingSolutions } = useQuery({
        queryKey: ['solutions-count'],
        queryFn: async () => {
            const { data } = await supabase.from('solutions').select('id, created_at').eq('is_deleted', false);
            return data || [];
        }
    });

    const isLoading = loadingMunicipalities || loadingChallenges || loadingPilots || loadingSolutions;

    return {
        municipalities,
        challenges,
        pilots,
        solutions,
        isLoading
    };
}
