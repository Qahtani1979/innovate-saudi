import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCitizenVotes() {
    return useQuery({
        queryKey: ['citizen-votes-coverage'],
        queryFn: async () => {
            const { data, error } = await supabase.from('citizen_votes').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

