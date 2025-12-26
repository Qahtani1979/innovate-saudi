import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStrategicPlans() {
    return useQuery({
        queryKey: ['strategic-plans-alignment'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('strategic_plans')
                .select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 // 1 hour
    });
}
