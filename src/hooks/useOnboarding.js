import { useMutation } from '@/hooks/useAppQueryClient';

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOnboardingMutation(programId) {
    const queryClient = useAppQueryClient();

    const completeOnboarding = useMutation({
        /**
         * @param {{ startDate: any, participantId: string, checklist: any, participantEmail: string, participantName: string, programName: string, durationWeeks: number, cohortSize: number }} params
         */
        mutationFn: async ({ participantId, checklist, participantEmail, participantName, programName, startDate, durationWeeks, cohortSize }) => {
            const { error } = await supabase
                .from('program_applications')
                .update({
                    onboarding_status: 'completed',
                    onboarding_completed_date: new Date().toISOString(),
                    onboarding_checklist: checklist
                })
                .eq('id', participantId);

            if (error) throw error;

            await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'pilot.enrollment_confirmed',
                    recipient_email: participantEmail,
                    entity_type: 'program',
                    entity_id: programId,
                    variables: {
                        participantName: participantName,
                        programName: programName,
                        programStart: startDate,
                        durationWeeks: durationWeeks,
                        cohortSize: cohortSize
                    },
                    triggered_by: 'system'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['program-applications']);
            toast.success('Onboarding completed');
        },
        onError: (error) => {
            console.error('Onboarding failed:', error);
            toast.error('Failed to complete onboarding: ' + error.message);
        }
    });

    return { completeOnboarding };
}



