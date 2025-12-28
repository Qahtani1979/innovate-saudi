import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useServiceDetail(serviceId) {
    return useQuery({
        queryKey: ['service-detail', serviceId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', serviceId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!serviceId
    });
}

