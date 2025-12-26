
import { useQuery } from '@tanstack/react-query';
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
