
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch stakeholder feedback for a pilot.
 */
export function useStakeholderFeedback(pilotId) {
    return useQuery({
        queryKey: ['stakeholder-feedback', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('stakeholder_feedback')
                .select('*')
                .eq('pilot_id', pilotId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId
    });
}

/**
 * Hook for stakeholder feedback mutations.
 */
export function useStakeholderFeedbackMutations() {
    const queryClient = useAppQueryClient();

    const submitFeedback = useMutation({
        mutationFn: async ({ pilotId, userEmail, feedback, satisfaction }) => {
            const { error } = await supabase.from('stakeholder_feedback').insert({
                pilot_id: pilotId,
                stakeholder_email: userEmail,
                stakeholder_role: 'stakeholder',
                feedback_type: 'progress_update',
                satisfaction_score: satisfaction,
                comments: feedback,
                sentiment: satisfaction >= 4 ? 'positive' : satisfaction >= 3 ? 'neutral' : 'negative'
            });
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['stakeholder-feedback', variables.pilotId]);
            toast.success('Feedback submitted successfully');
        },
        onError: (error) => {
            toast.error('Failed to submit feedback: ' + error.message);
        }
    });

    return {
        submitFeedback
    };
}

