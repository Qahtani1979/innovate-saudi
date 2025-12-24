import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export function useExpertEvaluation(entityType, entityId, expertEmail) {
    return useQuery({
        queryKey: ['expert_evaluation', entityId, expertEmail],
        queryFn: async () => {
            if (!expertEmail) return null;
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .eq('expert_email', expertEmail)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!expertEmail && !!entityId
    });
}

export function useExpertEvaluationMutations(entityType, entityId) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const submitEvaluation = useMutation({
        /**
         * @param {{ data: any, existingEvaluation: any }} params
         */
        mutationFn: async ({ data, existingEvaluation }) => {
            const overall_score = (data.feasibility_score + data.impact_score + data.innovation_score +
                data.sustainability_score + data.quality_score + data.alignment_score +
                data.scalability_score + (100 - data.risk_score)) / 8;

            if (existingEvaluation) {
                const { error } = await supabase
                    .from('expert_evaluations')
                    .update({
                        ...data,
                        overall_score,
                        evaluation_date: new Date().toISOString()
                    })
                    .eq('id', existingEvaluation.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('expert_evaluations').insert({
                    entity_type: entityType,
                    entity_id: entityId,
                    expert_email: user?.email,
                    expert_name: user?.full_name,
                    ...data,
                    overall_score,
                    evaluation_date: new Date().toISOString()
                });
                if (error) throw error;
            }

            await supabase.from('system_activities').insert({
                entity_type: entityType,
                entity_id: entityId,
                activity_type: 'expert_evaluation_submitted',
                performed_by: user?.email,
                timestamp: new Date().toISOString(),
                metadata: { overall_score, recommendation: data.recommendation }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expert_evaluation', entityId] });
            toast.success('Evaluation submitted successfully');
        },
        onError: (error) => {
            console.error('Failed to submit evaluation:', error);
            toast.error('Failed to submit evaluation');
        }
    });

    return { submitEvaluation };
}
