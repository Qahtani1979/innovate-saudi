import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePilotCollaborations() {
    return useQuery({
        queryKey: ['pilot-collaborations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilot_collaborations')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });
}
