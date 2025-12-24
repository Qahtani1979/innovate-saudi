import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch citizen feedback for an entity (challenge or pilot)
 */
export function useCitizenFeedback({ entityId, entityType } = {}) {
    return useQuery({
        queryKey: ['citizen-feedback', entityId, entityType],
        queryFn: async () => {
            // If no params, maybe return all? Or return empty? 
            // Existing code fetched all for 'coverage'. Let's support both.
            let query = supabase.from('citizen_feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (entityId) {
                query = query.eq('entity_id', entityId);
            }
            if (entityType) {
                query = query.eq('entity_type', entityType);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: true
    });
}

/**
 * Hook to submit citizen feedback
 */
export function useSubmitCitizenFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ entityId, entityType, content, feedbackType, isAnonymous, sentiment, rating }) => {
            const { error } = await supabase.from('citizen_feedback').insert({
                entity_id: entityId,
                entity_type: entityType,
                feedback_text: content,
                feedback_type: feedbackType,
                is_anonymous: isAnonymous,
                status: sentiment,
                rating: rating
            });
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['citizen-feedback'] });
            if (variables?.entityId) {
                queryClient.invalidateQueries({ queryKey: ['citizen-feedback', variables.entityId] });
            }
        }
    });
}
