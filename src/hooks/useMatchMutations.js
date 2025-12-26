import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * Hook for managing match status updates (accept/reject).
 */
export function useMatchMutations() {
    const queryClient = useAppQueryClient();
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge_solution_matches'] });
            // specialized queries invalidation
            queryClient.invalidateQueries({ queryKey: ['matchmaker-applications'] });
        },
        onError: (error) => {
            console.error('Match update failed:', error);
            toast.error('Failed to update match status');
        }
    });

    return { updateMatchStatus };
}

