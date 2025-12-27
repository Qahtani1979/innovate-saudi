import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook for managing match status updates (accept/reject).
 */
export function useMatchMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();
    const { user } = useAuth();

    const updateMatchStatus = useMutation({
        mutationFn: async ({ matchId, status, feedback }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('challenge_solution_matches')
                .update({
                    status: status,
                    municipality_feedback: feedback,
                    municipality_action_date: new Date().toISOString(),
                    municipality_reviewer_id: user.id
                })
                .eq('id', matchId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['challenge_solution_matches'] });
            // specialized queries invalidation
            queryClient.invalidateQueries({ queryKey: ['matchmaker-applications'] });
            queryClient.invalidateQueries({ queryKey: ['matchmaker-applications'] });

            // Notification: Match Status Updated
            notify({
                type: 'match_status_updated',
                entityType: 'match',
                entityId: variables.matchId,
                // Actually onSuccess receives (data, variables, context)
                // matchId is in variables.
                recipientEmails: [],
                title: 'Match Status Updated',
                message: 'Match status has been updated.',
                sendEmail: false
            });
        },
        onError: (error) => {
            console.error('Match update failed:', error);
            toast.error('Failed to update match status');
        }
    });

    return { updateMatchStatus };
}

