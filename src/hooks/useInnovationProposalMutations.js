import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInnovationProposalMutations() {
    const queryClient = useQueryClient();

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
        }
    });

    return {
        updateProposal,
        approveProposal,
        rejectProposal
    };
}
