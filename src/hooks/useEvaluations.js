import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

/**
 * Standardized hook for Expert Evaluations and Templates
 * Eliminates direct legacy/supabase usage in components.
 */
export function useEvaluations(params = {}) {
    const { entityType, entityId, evaluationStage } = params;
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    // Fetch Evaluation History
    const useHistory = (enabled = true) => {
        return useQuery({
            queryKey: ['evaluation-history', entityType, entityId],
            queryFn: async () => {
                if (!entityType || !entityId) return [];
                const { data, error } = await supabase
                    .from('expert_evaluations')
                    .select('*')
                    .eq('entity_type', entityType)
                    .eq('entity_id', entityId)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return (data || []).map(e => ({
                    ...e,
                    expert_email: e.evaluator_email,
                    feedback_text: e.comments,
                    evaluation_date: e.created_at,
                    ...(typeof e.criteria_scores === 'object' ? e.criteria_scores : {})
                }));
            },
            enabled: enabled && !!entityType && !!entityId
        });
    };

    // Fetch Evaluation Template
    const useTemplate = (enabled = true) => {
        return useQuery({
            queryKey: ['evaluation-template', entityType, evaluationStage],
            queryFn: async () => {
                if (!entityType || !evaluationStage) return null;
                const { data, error } = await supabase
                    .from('evaluation_templates')
                    .select('*')
                    .eq('entity_type', entityType)
                    .eq('evaluation_stage', evaluationStage)
                    .eq('is_active', true)
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
                if (!data) return null;

                // Map Supabase fields to the expected UI fields
                return {
                    ...data,
                    template_name_en: data.name_en,
                    template_name_ar: data.name_ar,
                    criteria_definitions: data.criteria,
                    recommendations_config: data.scoring_method // Or another field if needed
                };
            },
            enabled: enabled && !!entityType && !!evaluationStage
        });
    };

    // Submit Evaluation Mutation
    const submitEvaluation = useMutation({
        mutationFn: async (evaluationData) => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .insert({
                    ...evaluationData,
                    evaluation_date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evaluation-history', entityType, entityId] });
            toast.success(t({ en: 'Evaluation submitted successfully', ar: 'تم تقديم التقييم بنجاح' }));
        },
        onError: (error) => {
            console.error('Evaluation submission error:', error);
            toast.error(t({ en: 'Failed to submit evaluation', ar: 'فشل تقديم التقييم' }));
        }
    });

    return {
        useHistory,
        useTemplate,
        submitEvaluation
    };
}

export function useEvaluationsByEntity(entityType, entityId) {
    return useQuery({
        queryKey: ['evaluation-history', entityType, entityId],
        queryFn: async () => {
            if (!entityType || !entityId) return [];
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(e => ({
                ...e,
                expert_email: e.evaluator_email,
                feedback_text: e.comments,
                evaluation_date: e.created_at,
                ...(typeof e.criteria_scores === 'object' ? e.criteria_scores : {})
            }));
        },
        enabled: !!entityType && !!entityId
    });
}

export function useSubmitEvaluation(params = {}) {
    const { entityType, entityId, onComplete } = params;
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async (evaluationData) => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .insert({
                    ...evaluationData,
                    entity_type: entityType,
                    entity_id: entityId,
                    evaluation_date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evaluation-history', entityType, entityId] });
            toast.success(t({ en: 'Evaluation submitted successfully', ar: 'تم تقديم التقييم بنجاح' }));
            if (onComplete) onComplete();
        },
        onError: (error) => {
            console.error('Evaluation submission error:', error);
            toast.error(t({ en: 'Failed to submit evaluation', ar: 'فشل تقديم التقييم' }));
        }
    });
}

export function useEvaluationInvalidator() {
    const queryClient = useAppQueryClient();

    const invalidateEvaluations = (params = {}) => {
        const { entityType, entityId } = params;
        if (entityType && entityId) {
            queryClient.invalidateQueries({ queryKey: ['evaluation-history', entityType, entityId] });
        } else {
            queryClient.invalidateQueries({ queryKey: ['evaluation-history'] });
        }
    };

    return { invalidateEvaluations };
}


