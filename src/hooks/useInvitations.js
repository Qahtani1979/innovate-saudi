import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useInvitations() {
    return useQuery({
        queryKey: ['invitations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('user_invitations').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}
