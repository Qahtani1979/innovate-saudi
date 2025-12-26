import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * Hook for managing challenge voting
 * @param {string} challengeId
 * @param {number} initialVotes
 */
export function useChallengeVoting(challengeId, initialVotes = 0) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const { data: userVote, isLoading } = useQuery({
        queryKey: ['user-vote', challengeId, user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const { data, error } = await supabase
                .from('citizen_votes')
                .select('*')
                .eq('user_email', user.email)
                .eq('entity_type', 'challenge')
                .eq('entity_id', challengeId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user?.email && !!challengeId
    });

    const voteMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('User not authenticated');

            if (userVote) {
                // Unvote - delete the vote
                const { error: deleteError } = await supabase
                    .from('citizen_votes')
                    .delete()
                    .eq('id', userVote.id);
                if (deleteError) throw deleteError;

                // Update challenge vote count
                const { error: updateError } = await supabase
                    .from('challenges')
                    .update({ citizen_votes_count: Math.max(0, (initialVotes || 0) - 1) })
                    .eq('id', challengeId);
                if (updateError) throw updateError;
            } else {
                // Vote - insert new vote
                const { error: insertError } = await supabase
                    .from('citizen_votes')
                    .insert({
                        user_email: user.email,
                        user_id: user.id,
                        entity_type: 'challenge',
                        entity_id: challengeId,
                        vote_type: 'upvote'
                    });
                if (insertError) throw insertError;

                // Update challenge vote count
                const { error: updateError } = await supabase
                    .from('challenges')
                    .update({ citizen_votes_count: (initialVotes || 0) + 1 })
                    .eq('id', challengeId);
                if (updateError) throw updateError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-vote', challengeId] });
            queryClient.invalidateQueries({ queryKey: ['challenges'] }); // Refresh list to show new count
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] }); // Refresh detail
            toast.success(userVote ? 'Vote removed' : 'Vote recorded');
        },
        onError: (error) => {
            console.error('Voting failed:', error);
            toast.error('Failed to update vote');
        }
    });

    return {
        hasVoted: !!userVote,
        voteCount: initialVotes, // This should ideally come from the challenge data, but passed as prop for now
        isLoading: isLoading || voteMutation.isPending,
        toggleVote: () => voteMutation.mutate()
    };
}

