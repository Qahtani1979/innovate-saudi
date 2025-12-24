import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useExpertEvaluations(entityType, entityId) {
    return useQuery({
        queryKey: ['expert-evaluations', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!(entityType && entityId)
    });

}


export function useMyExpertEvaluation(entityType, entityId, email, stage) {
    return useQuery({
        queryKey: ['expert-evaluation', entityType, entityId, email, stage],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .eq('expert_email', email)
                .eq('evaluation_stage', stage)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
            return data;
        },
        enabled: !!(entityType && entityId && email)
    });
}

export function useExpertEvaluationMutations() {
    const queryClient = useQueryClient();

    const submitEvaluation = useMutation({
        mutationFn: async (/** @type {any} */ evaluationData) => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .insert(evaluationData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['expert-evaluations'] });
            queryClient.invalidateQueries({
                queryKey: ['expert-evaluation', variables.entity_type, variables.entity_id]
            });
        }
    });

    return {
        submitEvaluation
    };
}
