import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePublicPilot(pilotId) {
    return useQuery({
        queryKey: ['pilot-public', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('id', pilotId)
                .eq('is_deleted', false)
                .eq('is_published', true)
                .eq('is_confidential', false)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!pilotId
    });
}
