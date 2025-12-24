import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to handle evaluation completion with consensus checking
 */
export function useEvaluationCompletion() {
    const queryClient = useQueryClient();

    const completeEvaluation = useMutation({
        mutationFn: async ({ entityType, entityId }) => {
            // Invoke Edge Function to check consensus
            const { data, error } = await supabase.functions.invoke('checkConsensus', {
                body: { entity_type: entityType, entity_id: entityId }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['pilots-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['evaluations'] });
        }
    });

    return {
        completeEvaluation
    };
}

export default useEvaluationCompletion;
