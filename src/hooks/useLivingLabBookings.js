import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMyLabBookings(labIds = []) {
    return useQuery({
        queryKey: ['my-lab-bookings', labIds],
        queryFn: async () => {
            if (labIds.length === 0) return [];
            const { data, error } = await supabase.from('living_lab_bookings').select('*');
            if (error) throw error;
            return data?.filter(b => labIds.includes(b.living_lab_id)) || [];
        },
        enabled: labIds.length > 0
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
