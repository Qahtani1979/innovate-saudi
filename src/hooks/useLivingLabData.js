import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch living lab bookings
 */
export function useLivingLabBookings() {
    return useQuery({
        queryKey: ['lab-bookings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_lab_bookings')
                .select('*')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

/**
 * Hook to fetch pilots associated with living labs
 */
export function usePilotsForLabs() {
    return useQuery({
        queryKey: ['pilots-for-labs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('id, living_lab_id')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

export default { useLivingLabBookings, usePilotsForLabs };
