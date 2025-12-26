
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useFollowUpMutations(programId) {
    const queryClient = useQueryClient();

    const updateFollowUp = useMutation({
        mutationFn: async ({ program, followUpData, selectedParticipant }) => {
            // Update program outcomes
            const { error } = await supabase
                .from('programs')
                .update({
                    outcomes: {
                        ...program.outcomes,
                        follow_up_data: followUpData,
                        last_follow_up: new Date().toISOString()
                    }
                })
                .eq('id', program.id);

            if (error) throw error;

            // Send follow-up email
            if (selectedParticipant) {
                await supabase.functions.invoke('email-trigger-hub', {
                    body: {
                        trigger: 'pilot.feedback_request', // Keeping original trigger name
                        recipient_email: selectedParticipant.email, // Original used app.email? No, app.contact_email exists? Original used selectedParticipant.email
                        entity_type: 'program',
                        entity_id: program.id,
                        variables: {
                            programName: program.name_en,
                            participantName: selectedParticipant.name // or organization name? keeping generic
                        },
                        triggered_by: 'system'
                    }
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['program', programId]);
            toast.success('Follow-up recorded successfully');
        },
        onError: (error) => {
            console.error('Follow-up failed:', error);
            toast.error('Failed to save follow-up');
        }
    });

    return {
        updateFollowUp
    };
}
