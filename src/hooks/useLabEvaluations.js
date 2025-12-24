import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLabProjectEvaluations(projectId, evaluationType) {
    return useQuery({
        queryKey: ['lab-evaluations', projectId, evaluationType],
        queryFn: async () => {
            const query = supabase
                .from('lab_project_evaluations')
                .select('*')
                .eq('project_id', projectId);

            if (evaluationType) {
                query.eq('evaluation_type', evaluationType);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!projectId
    });
}

export function useSubmitLabEvaluation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ evaluationData, decision, livingLabId, projectId, userEmail, evaluationType = 'ethics_review' }) => {
            const overall = Math.round(
                (evaluationData.scientific_merit_score * 0.25) +
                (evaluationData.citizen_benefit_score * 0.25) +
                (evaluationData.safety_score * 0.2) +
                (evaluationData.ethics_score * 0.2) +
                (evaluationData.feasibility_score * 0.1)
            );

            const { error } = await supabase.from('lab_project_evaluations').insert({
                living_lab_id: livingLabId,
                project_id: projectId,
                evaluator_email: userEmail,
                evaluation_type: evaluationType,
                scientific_merit_score: evaluationData.scientific_merit_score,
                citizen_benefit_score: evaluationData.citizen_benefit_score,
                safety_score: evaluationData.safety_score,
                ethics_score: evaluationData.ethics_score,
                feasibility_score: evaluationData.feasibility_score,
                overall_score: overall,
                recommendation: decision,
                ethics_concerns: evaluationData.ethics_concerns || [],
                safety_requirements: evaluationData.safety_requirements || [],
                evaluation_notes: evaluationData.evaluation_notes,
                evaluation_date: new Date().toISOString()
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-evaluations'] });
            toast.success('Evaluation submitted successfully');
        }
    });
}
