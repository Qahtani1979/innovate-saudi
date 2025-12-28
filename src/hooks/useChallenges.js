
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useChallenges() {
    return useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });
}

export function useChallenge(id) {
    return useQuery({
        queryKey: ['challenge', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });

}

export function useTopChallenges(limit = 100) {
    return useQuery({
        queryKey: ['challenges-top', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_deleted', false)
                .order('overall_score', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        }
    });
}

export function useStrategicChallenges() {
    return useQuery({
        queryKey: ['strategic-challenges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .or('priority.eq.tier_1,priority.eq.tier_2')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });
}


