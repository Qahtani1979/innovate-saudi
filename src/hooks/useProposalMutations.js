import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook for proposal mutations
 */
export function useProposalMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();
    const { notify } = useNotificationSystem();

    const createProposal = useMutation({
        mutationFn: async (data) => {
            const proposalData = {
                ...data,
                proposer_email: user?.email,
                submitted_at: new Date().toISOString(),
                status: data.status || 'submitted'
            };

            const { data: proposal, error } = await supabase
                .from('challenge_proposals')
                .insert(proposalData)
                .select()
                .single();

            if (error) throw error;



            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'challenge_proposal', proposal.id, null, proposalData);

            // Notification: Proposal Submitted
            await notify({
                type: 'challenge_proposal_submitted',
                entityType: 'challenge_proposal',
                entityId: proposal.id,
                recipientEmails: [user?.email].filter(Boolean),
                title: 'Proposal Submitted Successfully',
                message: `Your proposal "${proposalData.title || 'Untitled'}" has been submitted.`,
                sendEmail: true,
                emailTemplate: 'challenge_proposal.submitted',
                emailVariables: {
                    user_name: user?.user_metadata?.full_name || 'Innovator',
                    proposal_title: proposalData.title || 'Untitled',
                    submission_date: new Date().toLocaleDateString()
                }
            });

            return proposal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['my-proposals'] });
            toast.success(t({ en: 'Proposal submitted successfully', ar: 'تم إرسال المقترح بنجاح' }));
        },
        onError: (error) => {
            console.error('Create proposal error:', error);
            toast.error(t({ en: 'Failed to submit proposal', ar: 'فشل إرسال المقترح' }));
        }
    });

    const updateProposal = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentProposal } = await supabase
                .from('challenge_proposals')
                .select('*')
                .eq('id', id)
                .single();

            const { data: proposal, error } = await supabase
                .from('challenge_proposals')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'challenge_proposal', id, currentProposal, data);

            // Notification: Status Change
            if (data.status && data.status !== currentProposal.status) {
                await notify({
                    type: `challenge_proposal_${data.status}`,
                    entityType: 'challenge_proposal',
                    entityId: id,
                    recipientEmails: [currentProposal.proposer_email].filter(Boolean),
                    title: `Proposal Status Update: ${data.status}`,
                    message: `Your proposal "${currentProposal.title}" status has been updated to: ${data.status}.`,
                    sendEmail: true,
                    emailTemplate: 'challenge_proposal.status_update',
                    emailVariables: {
                        proposal_title: currentProposal.title,
                        new_status: data.status,
                        update_date: new Date().toLocaleDateString()
                    }
                });
            }

            return proposal;
        },
        onSuccess: (proposal) => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-proposal', proposal.id] });
            toast.success(t({ en: 'Proposal updated', ar: 'تم تحديث المقترح' }));
        },
        onError: (error) => {
            console.error('Update proposal error:', error);
            toast.error(t({ en: 'Failed to update proposal', ar: 'فشل تحديث المقترح' }));
        }
    });

    return {
        createProposal,
        updateProposal
    };
}

