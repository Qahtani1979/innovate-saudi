import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLivingLabData(livingLabId) {
    const bookingsQuery = useQuery({
        queryKey: ['living-lab-bookings', livingLabId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_lab_bookings')
                .select('*')
                .eq('living_lab_id', livingLabId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!livingLabId
    });

    const projectsQuery = useQuery({
        queryKey: ['living-lab-projects', livingLabId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .eq('living_lab_id', livingLabId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!livingLabId
    });

    return {
        bookings: bookingsQuery.data || [],
        projects: projectsQuery.data || [],
        isLoading: bookingsQuery.isLoading || projectsQuery.isLoading,
        refetch: () => {
            bookingsQuery.refetch();
            projectsQuery.refetch();
        }
    };
}
