import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function useComments(entityType, entityId) {
    return useQuery({
        queryKey: ['comments', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        },
        enabled: !!(entityType && entityId)
    });
}

/**
 * Hook for managing comment mutations
 * @param {string} entityType - Optional entity type for targeted invalidation
 * @param {string} entityId - Optional entity ID for targeted invalidation
 */
export function useCommentMutations(entityType = null, entityId = null) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    /** @type {import('@tanstack/react-query').UseMutationResult<any, Error, {entity_type: string, entity_id: string, comment_text: string, user_name: string, user_email: string}>} */
    const addComment = useMutation({
        mutationFn: async (commentData) => {
            const { error } = await supabase.from('comments').insert(commentData);
            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            const eType = variables.entity_type || entityType;
            const eId = variables.entity_id || entityId;
            if (eType && eId) {
                queryClient.invalidateQueries({ queryKey: ['comments', eType, eId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['comments'] });
            }
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, Error, {id: string}>} */
    const flagComment = useMutation({
        mutationFn: async ({ id }) => {
            const { error } = await supabase
                .from('comments')
                .update({ is_internal: true })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            if (entityType && entityId) {
                queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['comments'] });
            }
        }
    });

    return { addComment, flagComment };
}
