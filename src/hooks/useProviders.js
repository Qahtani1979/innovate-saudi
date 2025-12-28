import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useProviders() {
    return useQuery({
        queryKey: ['providers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('providers')
                .select('*')
                .eq('is_deleted', false)
                .order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 // 1 hour
    });
}

