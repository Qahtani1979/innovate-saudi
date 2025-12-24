import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch program-pilot conversion links
 */
export function useProgramPilotLinks() {
    return useQuery({
        queryKey: ['program-pilot-links'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_pilot_links')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}
