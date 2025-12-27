
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useEmailTrigger } from './useEmailTrigger';

export function useWaitlist(programId) {
    const queryClient = useAppQueryClient();
    const { triggerEmail } = useEmailTrigger();
    const { notify } = useNotificationSystem();

    const waitlistQuery = useQuery({
        queryKey: ['waitlist-applications', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('program_id', programId)
                .eq('status', 'waitlisted')
                .order('ai_score', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });

    const promoteMutation = useMutation({
        mutationFn: async (appId) => {
            const app = waitlistQuery.data?.find(a => a.id === appId);
            if (!app) throw new Error("Application not found");

            const { error } = await supabase
                .from('program_applications')
                .update({
                    status: 'accepted',
                    waitlist_promoted_date: new Date().toISOString()
                })
                .eq('id', appId);
            if (error) throw error;

            await triggerEmail({
                trigger: 'program.application_status',
                recipient_email: app.applicant_email,
                entity_type: 'program',
                entity_id: programId,
                variables: {
                    userName: app.applicant_name,
                    status: 'waitlist_promoted'
                },
                triggered_by: 'system'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['waitlist-applications', programId]);
            queryClient.invalidateQueries(['program-applications', programId]);
            notify.success('Participant promoted from waitlist');
        },
        onError: (error) => {
            notify.error('Failed to promote participant: ' + error.message);
        }
    });

    return {
        waitlist: waitlistQuery.data || [],
        isLoading: waitlistQuery.isLoading,
        promoteToParticipant: promoteMutation
    };
}

