import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function useLivingLabConsultations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const createConsultation = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('living_lab_bookings') // Targeting global bookings/consultations table
                .insert({
                    ...data,
                    status: 'pending'
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['livinglab-bookings'] });
            toast.success(t({ en: 'Consultation booked', ar: 'تم حجز الاستشارة' }));
        },
        onError: (error) => {
            console.error('Error booking consultation:', error);
            toast.error(t({ en: 'Failed to book consultation', ar: 'فشل حجز الاستشارة' }));
        }
    });

    const inviteExpert = useMutation({
        mutationFn: async ({ email, name, labName, details }) => {
            const { error } = await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'panel.invitation',
                    recipient_email: email,
                    entity_type: 'livinglab',
                    // entity_id: ?,
                    variables: {
                        expertName: name,
                        labName: labName,
                        ...details
                    }
                }
            });
            if (error) throw error;
        },
        onError: (error) => {
            console.error('Failed to send expert invitation:', error);
            // Don't show toast as this is usually a background side-effect
        }
    });

    return {
        createConsultation,
        inviteExpert
    };
}
