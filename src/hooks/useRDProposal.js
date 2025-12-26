import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRDProposal(id, options = {}) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['rd-proposal', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('rd_proposals')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        ...options
    });

    const updateMutation = useMutation({
        /** @param {any} updates */
        mutationFn: async (updates) => {
            const { data, error } = await supabase
                .from('rd_proposals')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposal', id] });
            toast.success('Proposal updated successfully');
        }
    });

    const addComment = useMutation({
        /** @param {{ comment_text: string, is_internal?: boolean, user_email?: string }} params */
        mutationFn: async ({ comment_text, is_internal = false, user_email = 'system@example.com' }) => {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    entity_type: 'rd_proposal',
                    entity_id: id,
                    comment_text,
                    is_internal,
                    user_email
                });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rdproposal-comments', id] });
            toast.success('Comment added');
        }
    });

    /**
     * @type {{
     *  data: any,
     *  isLoading: boolean,
     *  updateProposal: (updates: any) => void,
     *  isUpdating: boolean,
     *  addComment: (params: { comment_text: string, is_internal?: boolean, user_email?: string }) => void,
     *  isAddingComment: boolean
     * }}
     */
    const result = {
        ...query,
        updateProposal: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        addComment: addComment.mutate,
        isAddingComment: addComment.isPending
    };

    return result;
}
