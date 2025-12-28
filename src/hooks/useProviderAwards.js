import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useProviderAwards() {
    return useQuery({
        queryKey: ['provider-awards'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('provider_awards')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

