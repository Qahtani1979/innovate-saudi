import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useRewards() {
    return useQuery({
        queryKey: ['available-rewards'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rewards')
                .select('*')
                .eq('status', 'active')
                .order('points_cost', { ascending: true });
            if (error) throw error;
            return data || [];
        }
    });
}

