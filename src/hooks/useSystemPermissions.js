import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useSystemPermissions() {
    return useQuery({
        queryKey: ['system-permissions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('permissions').select('*').order('code');
            if (error) throw error;
            return data || [];
        }
    });
}

