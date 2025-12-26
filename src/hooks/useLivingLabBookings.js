import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function useMyLabBookings(labIds = []) {
    return useQuery({
        queryKey: ['my-lab-bookings', labIds],
        queryFn: async () => {
            if (labIds.length === 0) return [];
            const { data, error } = await supabase
                .from('living_lab_resource_bookings')
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
        queryKey: ['resource-bookings', labId], // Matched query key from component
        queryFn: async () => {
            // If labId is provided, filter by it. Original hook filtered by is_deleted=false? 
            // Component didn't filter by is_deleted. I'll filter by labId.
            let query = supabase
                .from('living_lab_resource_bookings')
                .select('*');

            if (labId) {
                query = query.eq('living_lab_id', labId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!labId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

export function useLivingLabBookingMutations(labId) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const createBooking = useMutation({
        mutationFn: async (data) => {
            // 1. Create Booking
            const { data: booking, error } = await supabase
                .from('living_lab_resource_bookings')
                .insert({
                    ...data,
                    // living_lab_id: labId, // Expect data to likely contain it or we merge it
                    status: 'pending'
                })
                .select()
                .single();
            if (error) throw error;

            // 2. Create Notification (for Admin) - This logic was in component
            // We ideally fetch lab name but let's assume it's passed or we fetch it?
            // For simplicity, we can do it here if we have lab name via hook arg or similar. 
            // Better: Component passes lab name in data or we just say "Living Lab Resource"

            await supabase.from('notifications').insert({
                title: `New Resource Booking Request`,
                body: `${data.requester_name} requested ${data.resource_name}`,
                notification_type: 'approval',
                priority: 'medium',
                link_url: labId ? `/LivingLabDetail?id=${labId}` : '/LivingLabs', // Adjust link
                entity_type: 'LivingLabResourceBooking',
                entity_id: booking.id,
                action_required: true,
                // user_id: ? Need to notify admin.
            });

            return booking;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['my-lab-bookings'] });
            toast.success(t({ en: 'Booking request submitted', ar: 'تم إرسال طلب الحجز' }));
        },
        onError: (error) => {
            console.error('Error creating booking:', error);
            toast.error(t({ en: 'Failed to create booking', ar: 'فشل إنشاء الحجز' }));
        }
    });

    const updateBookingStatus = useMutation({
        mutationFn: async ({ id, status, approved_by, resource_name, lab_id }) => {
            const { error } = await supabase
                .from('living_lab_resource_bookings')
                .update({
                    status,
                    approved_by: approved_by,
                    approval_date: new Date().toISOString(),
                    notification_sent: true
                })
                .eq('id', id);

            if (error) throw error;

            // Notify requester
            await supabase.from('notifications').insert({
                title: status === 'approved' ? 'Resource Booking Approved' : 'Resource Booking Rejected',
                body: `Your booking request for ${resource_name} has been ${status}.`,
                notification_type: 'alert',
                priority: status === 'approved' ? 'medium' : 'high',
                link_url: lab_id ? `/LivingLabDetail?id=${lab_id}` : '#',
                entity_type: 'LivingLabResourceBooking',
                entity_id: id
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
            toast.success(t({ en: 'Booking updated', ar: 'تم تحديث الحجز' }));
        },
        onError: (error) => {
            console.error('Error updating booking:', error);
            toast.error(t({ en: 'Failed to update booking', ar: 'فشل تحديث الحجز' }));
        }
    });

    return { createBooking, updateBookingStatus };
}
