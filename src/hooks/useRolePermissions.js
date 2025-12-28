import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useRolePermissions() {
    return useQuery({
        queryKey: ['role-permissions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('role_permissions')
                .select('*, permissions(code, name)');

            if (error) throw error;
            return data || [];
        }
    });
}

