import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation } from '@/hooks/useAppQueryClient';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { useAuth } from '@/lib/AuthContext';

export function useChallengeProposalMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();
    const { logCrudOperation } = useAuditLogger();
    const { user } = useAuth();

    const respondToProposal = useMutation({
        /**
         * @param {{ proposalId: string, status: string, message: string }} params
         */
        mutationFn: async ({ proposalId, status, message }) => {
            // Join with profiles/users to get email
            const { data: currentProposal, error: fetchError } = await supabase
                .from('challenge_proposals')
                .select(`
                    id, 
                    user_id, 
                    challenge_id,
                    profiles!inner(email) 
                `)
                .eq('id', proposalId)
                .single();

            if (fetchError) throw fetchError;
            // @ts-ignore
            if (!currentProposal || !currentProposal.profiles || !currentProposal.profiles.email) {
                throw new Error('Could not retrieve proposal owner email.');
            }
            const proposalOwnerEmail = currentProposal.profiles.email;

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

            await logCrudOperation('update', 'challenge_proposal', proposalId, currentProposal, { status, message });

            // Notify Proposal Owner
            const notificationType = status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected';
            await notify({
                type: notificationType,
                entityType: 'challenge_proposal',
                entityId: proposalId,
                recipientEmails: [proposalOwnerEmail],
                title: status === 'accepted' ? 'Proposal Accepted' : 'Proposal Rejected',
                message: `Your proposal has been ${status}. Message: ${message}`,
                metadata: { challenge_id: data.challenge_id, status },
                sendEmail: true,
                emailTemplate: notificationType,
                emailVariables: {
                    proposal_status: status,
                    response_message: message
                }
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            toast.success('Response sent successfully');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const reviewProposal = useMutation({
        mutationFn: async ({ proposalId, status, notes, reviewerEmail }) => {
            // Fetch proposal owner's email
            const { data: currentProposal, error: fetchError } = await supabase
                .from('challenge_proposals')
                .select(`
                    id, 
                    user_id, 
                    challenge_id,
                    profiles!inner(email) 
                `)
                .eq('id', proposalId)
                .single();

            if (fetchError) throw fetchError;
            // @ts-ignore
            const proposalOwnerEmail = currentProposal?.profiles?.email;

            const { data, error } = await supabase
                .from('challenge_proposals')
                .update({
                    status,
                    review_notes: notes,
                    reviewer_email: reviewerEmail,
                    review_date: new Date().toISOString()
                })
                .eq('id', proposalId)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation('update', 'challenge_proposal', proposalId, currentProposal, { status, notes, reviewerEmail });

            // Notify Proposal Owner
            await notify({
                type: 'proposal_reviewed',
                entityType: 'challenge_proposal',
                entityId: proposalId,
                recipientEmails: [proposalOwnerEmail],
                title: 'Proposal Reviewed',
                message: `Your proposal status has been updated to ${status}. Notes: ${notes}`,
                metadata: { challenge_id: currentProposal.challenge_id, status },
                sendEmail: true,
                emailTemplate: 'proposal_reviewed', // Ensure this template exists or generic
                emailVariables: {
                    proposal_status: status,
                    review_notes: notes
                }
            });

            return data;
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


