import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLivingLabActivities(livingLabId) {
    return useQuery({
        queryKey: ['lab-activities', livingLabId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_id', livingLabId)
                .eq('entity_type', 'LivingLab')
                .order('created_date', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data;
        },
        enabled: !!livingLabId
    });
}

export function useRecentLivingLabBookings(livingLabId) {
    return useQuery({
        queryKey: ['lab-bookings', livingLabId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_lab_bookings')
                .select('*')
                .eq('living_lab_id', livingLabId)
                .order('created_date', { ascending: false })
                .limit(30);

            if (error) throw error;
            return data;
        },
        enabled: !!livingLabId
    });
}
