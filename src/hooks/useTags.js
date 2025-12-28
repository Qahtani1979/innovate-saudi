import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useTags() {
    return useQuery({
        queryKey: ['tags-all'],
        queryFn: async () => {
            const { data, error } = await supabase.from('tags').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        }
    });
}

