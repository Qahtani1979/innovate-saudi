import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useInnovationProposalMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

    const updateProposal = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase
                .from('innovation_proposals')
                .update(data)
                .eq('id', id);

            if (error) throw error;
            return { id, ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals-with-visibility'] });
            toast.success('Proposal updated successfully');
        },
        onError: (error) => {
            console.error('Proposal update error:', error);
            toast.error('Failed to update proposal');
        }
    });

    const approveProposal = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('innovation_proposals').update({ status: 'approved' }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals-with-visibility'] });
            toast.success('Proposal approved');

            // Notification: Proposal Approved
            notify({
                type: 'innovation_proposal_approved',
                entityType: 'innovation_proposal',
                entityId: id,
                recipientEmails: [],
                title: 'Innovation Proposal Approved',
                message: 'Your innovation proposal has been approved.',
                sendEmail: true
            });
        }
    });

    const rejectProposal = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('innovation_proposals').update({ status: 'rejected' }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals-with-visibility'] });
            toast.success('Proposal rejected');

            // Notification: Proposal Rejected
            notify({
                type: 'innovation_proposal_rejected',
                entityType: 'innovation_proposal',
                entityId: id,
                recipientEmails: [],
                title: 'Innovation Proposal Rejected',
                message: 'Your innovation proposal has been rejected.',
                sendEmail: true
            });
        }
    });

    return {
        updateProposal,
        approveProposal,
        rejectProposal,
        createProposal: useMutation({
            mutationFn: async (data) => {
                const { data: result, error } = await supabase
                    .from('innovation_proposals')
                    .insert(data)
                    .select()
                    .single();

                if (error) throw error;
                return result;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
                queryClient.invalidateQueries({ queryKey: ['innovation-proposals-with-visibility'] });
                queryClient.invalidateQueries({ queryKey: ['innovation-proposals-with-visibility'] });
                toast.success('Proposal submitted successfully');

                // Notification: Proposal Submitted
                notify({
                    type: 'innovation_proposal_submitted',
                    entityType: 'innovation_proposal',
                    entityId: 'new', // data.id is returned but not in scope here unless we capture it
                    recipientEmails: [],
                    title: 'Innovation Proposal Submitted',
                    message: 'Your innovation proposal has been submitted.',
                    sendEmail: true
                });
            },
            onError: (error) => {
                console.error('Proposal creation error:', error);
                toast.error('Failed to submit proposal');
            }
        })
    };
}

