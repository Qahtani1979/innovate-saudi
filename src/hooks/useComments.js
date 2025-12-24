import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export function useComments(entityType, entityId) {
    return useQuery({
        queryKey: ['comments', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!(entityType && entityId)
    });
}

export function useCommentMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth(); // Assuming AuthProvider exposes user

    const addComment = useMutation({
        mutationFn: async (commentData) => {
            const { error } = await supabase.from('comments').insert(commentData);
            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['comments', variables.entity_type, variables.entity_id]);
        }
    });

    return { addComment };
}
