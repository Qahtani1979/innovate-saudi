import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useServicePerformance(serviceId) {
    return useQuery({
        queryKey: ['service-performance', serviceId],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('service_performance')
                .select('*')
                .eq('service_id', serviceId);

            if (error) {
                console.error('Error fetching service performance:', error);
                throw error;
            }

            return (/** @type {any[]} */ (data) || []).sort((a, b) => new Date(b.period_end) - new Date(a.period_end));
        },
        enabled: !!serviceId
    });
}

