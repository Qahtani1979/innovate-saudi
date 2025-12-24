import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMIIDimensions() {
    return useQuery({
        queryKey: ['mii-dimensions-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('mii_dimensions').select('*').order('sort_order');
            if (error) throw error;
            return data || [];
        }
    });
}
