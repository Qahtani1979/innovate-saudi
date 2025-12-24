import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePartnerships() {
    return useQuery({
        queryKey: ['partnerships'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('partnerships')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });
}
