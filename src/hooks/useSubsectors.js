import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSubsectors() {
    return useQuery({
        queryKey: ['subsectors'],
        queryFn: async () => {
            const { data, error } = await supabase.from('subsectors').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        }
    });
}
