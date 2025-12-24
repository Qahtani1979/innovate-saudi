import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSandboxEvaluations(sandboxApplicationId) {
    return useQuery({
        queryKey: ['sandbox-evaluations', sandboxApplicationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_application_evaluations')
                .select('*')
                .eq('sandbox_application_id', sandboxApplicationId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!sandboxApplicationId
    });
}

export function useSandboxEvaluationMutations() {
    const queryClient = useQueryClient();

    const submitEvaluation = useMutation({
        /**
         * @param {{ sandboxApplicationId: string, userEmail: string, evaluation: any }} params
         */
        mutationFn: async ({ sandboxApplicationId, userEmail, evaluation }) => {
            const overall = Math.round(
                (evaluation.safety_score * 0.3) +
                (evaluation.regulatory_compliance_score * 0.3) +
                (evaluation.technical_feasibility_score * 0.2) +
                (evaluation.infrastructure_readiness_score * 0.2)
            );

            const { error } = await supabase.from('sandbox_application_evaluations').insert({
                sandbox_application_id: sandboxApplicationId,
                evaluator_email: userEmail,
                evaluator_role: 'technical_expert',
                safety_score: evaluation.safety_score,
                regulatory_compliance_score: evaluation.regulatory_compliance_score,
                technical_feasibility_score: evaluation.technical_feasibility_score,
                infrastructure_readiness_score: evaluation.infrastructure_readiness_score,
                overall_score: overall,
                recommendation: evaluation.recommendation,
                evaluation_notes: evaluation.evaluation_notes,
                evaluation_date: new Date().toISOString()
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-evaluations'] });
            toast.success('Evaluation submitted successfully');
        },
        onError: (error) => {
            console.error('Failed to submit evaluation:', error);
            toast.error('Failed to submit evaluation');
        }
    });

    return { submitEvaluation };
}
