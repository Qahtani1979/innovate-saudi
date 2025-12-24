import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMyLabBookings(labIds = []) {
    return useQuery({
        queryKey: ['my-lab-bookings', labIds],
        queryFn: async () => {
            if (labIds.length === 0) return [];
            const { data, error } = await supabase
                .from('living_lab_bookings')
                .select('*')
                .in('living_lab_id', labIds);
            if (error) throw error;
            return data || [];
        },
        enabled: labIds.length > 0
    });
}

export function useLivingLabBookings(labId = null) {
    return useQuery({
        queryKey: ['lab-bookings', labId],
        queryFn: async () => {
            let query = supabase
                .from('living_lab_bookings')
                .select('*')
                .eq('is_deleted', false);

            if (labId) {
                query = query.eq('living_lab_id', labId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

export function useLivingLabBookingMutations() {
    const queryClient = useQueryClient();

    const createBooking = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('living_lab_bookings').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['living-lab-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['my-lab-bookings'] });
            toast.success('Booking created successfully');
        },
        onError: (error) => {
            console.error('Error creating booking:', error);
            toast.error('Failed to create booking');
        }
    });

    return { createBooking };
}
