import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRDProposalComments(rdProposalId) {
    return useQuery({
        queryKey: ['rd-proposal-comments', rdProposalId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_proposal_comments')
                .select('*')
                .eq('rd_proposal_id', rdProposalId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!rdProposalId,
    });
}

export function useAddRDProposalComment() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ rd_proposal_id, comment_text, section = 'general' }) => {
            const { data, error } = await supabase
                .from('rd_proposal_comments')
                .insert([{
                    rd_proposal_id,
                    comment_text,
                    section
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposal-comments', variables.rd_proposal_id] });
            toast.success('Comment added successfully');
        },
        onError: (error) => {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        },
    });
}



