import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch citizen feedback for an entity (challenge or pilot)
 */
export function useCitizenFeedback(options = {}) {
    const {
        entityId,
        entityType,
        feedbackType,
        challengeId,
        orderBy = 'created_at',
        orderDirection = 'desc',
        isPublished = true
    } = options;

    return useQuery({
        queryKey: ['citizen-feedback', { entityId, entityType, feedbackType, challengeId, orderBy, orderDirection, isPublished }],
        queryFn: async () => {
            // @ts-ignore
            let query = supabase.from('citizen_feedback')
                .select('*')
                .order(orderBy, { ascending: orderDirection === 'asc' });

            if (entityId) query = query.eq('entity_id', entityId);
            if (entityType) query = query.eq('entity_type', entityType);
            if (feedbackType) query = query.eq('feedback_type', feedbackType);
            if (challengeId) query = query.eq('challenge_id', challengeId);
            if (isPublished !== undefined) query = query.eq('is_published', isPublished);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to submit citizen feedback
 */
export function useSubmitCitizenFeedback() {
    const queryClient = useAppQueryClient();

    /** @type {import('@/hooks/useAppQueryClient').UseMutationResult<any, Error, {entityId?: string, entityType?: string, content: string, feedbackType: string, isAnonymous: boolean, sentiment?: string, rating?: number}>} */
    const mutation = useMutation({
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-feedback'] });
        }
    });

    return mutation;
}

export const useCitizenFeedbackMutation = useSubmitCitizenFeedback;


