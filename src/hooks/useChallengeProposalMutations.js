import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChallengeProposalMutations() {
    const queryClient = useAppQueryClient();

    const respondToProposal = useMutation({
        /**
         * @param {{ proposalId: string, status: string, message: string }} params
         */
        mutationFn: async ({ proposalId, status, message }) => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .update({
                    status,
                    municipality_response_date: new Date().toISOString(),
                    municipality_response_message: message
                })
                .eq('id', proposalId)
                .select()
                .single();

            if (error) throw error;

            await supabase.from('system_activities').insert({
                entity_type: 'ChallengeProposal',
                entity_id: proposalId,
                activity_type: status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected',
                description_en: `Municipality responded: ${status}`
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            // Invalidate specific queries if needed, e.g., ['proposals-for-my-challenges']
            toast.success('Response sent successfully');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const reviewProposal = useMutation({
        mutationFn: async ({ proposalId, status, notes, reviewerEmail }) => {
            const { error } = await supabase
                .from('challenge_proposals')
                .update({
                    status,
                    review_notes: notes,
                    reviewer_email: reviewerEmail,
                    review_date: new Date().toISOString()
                })
                .eq('id', proposalId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            toast.success('Proposal reviewed successfully');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    return {
        respondToProposal,
        reviewProposal
    };
}

