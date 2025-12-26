import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export function useExpertEvaluations(entityType, entityId) {
    return useQuery({
        queryKey: ['expert-evaluations', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('evaluation_date', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!(entityType && entityId)
    });
}

export function useExpertEvaluation(entityType, entityId, expertEmail) {
    return useQuery({
        queryKey: ['expert-evaluation', entityType, entityId, expertEmail],
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
        enabled: !!(expertEmail && entityId && entityType)
    });
}

export function useExpertEvaluationMutations(entityType, entityId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const submitEvaluation = useMutation({
        mutationFn: async ({ data, existingEvaluation }) => {
            let overall_score = data.overall_score;

            if (overall_score === undefined || overall_score === null) {
                // Calculate if not provided
                // Assuming these are the standard fields, or 0 if missing.
                const scores = [
                    data.feasibility_score,
                    data.impact_score,
                    data.innovation_score,
                    data.sustainability_score,
                    data.quality_score,
                    data.alignment_score,
                    data.scalability_score,
                    data.risk_score ? (100 - data.risk_score) : undefined
                ].filter(s => s !== undefined && s !== null);

                if (scores.length > 0) {
                    overall_score = scores.reduce((a, b) => a + b, 0) / scores.length;
                } else {
                    // Fallback for events if using different fields (like in EventExpertEvaluation)
                    const eventScores = [
                        data.content_quality_score,
                        data.organization_score,
                        data.speaker_quality_score,
                        data.audience_engagement_score,
                        data.logistics_score,
                        data.value_score,
                        data.innovation_score,
                        data.impact_score
                    ].filter(s => s !== undefined && s !== null);

                    if (eventScores.length > 0) {
                        overall_score = eventScores.reduce((a, b) => a + b, 0) / eventScores.length;
                    }
                }
            }

            // Ensure overall_score is a number
            if (isNaN(overall_score)) overall_score = 0;


            if (existingEvaluation?.id) {
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

            // Log activity
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
            queryClient.invalidateQueries({ queryKey: ['expert-evaluations'] });
            queryClient.invalidateQueries({ queryKey: ['expert-evaluation', entityType, entityId] });
            toast.success('Evaluation submitted successfully');
        },
        onError: (error) => {
            console.error('Failed to submit evaluation:', error);
            toast.error('Failed to submit evaluation');
        }
    });

    return { submitEvaluation };
}

