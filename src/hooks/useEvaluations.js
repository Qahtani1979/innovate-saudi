import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to fetch evaluation templates
 */
export function useEvaluationTemplates() {
    return useQuery({
        queryKey: ['evaluation-templates'],
        queryFn: async () => {
            const { data, error } = await supabase.from('evaluation_templates').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch evaluations by entity
 */
export function useEvaluationsByEntity(entityType, entityId) {
    return useQuery({
        queryKey: ['expert-evaluations', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .eq('is_deleted', false);

            if (error) throw error;
            return (data || []);
        },
        enabled: !!entityType && !!entityId
    });
}

/**
 * Hook for evaluation mutations
 */
export function useEvaluationMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { logAction } = useAuditLogger();

    const createTemplate = useMutation({
        mutationFn: async (data) => {
            const { data: newTemplate, error } = await supabase.from('evaluation_templates').insert([data]).select().single();
            if (error) throw error;
            return newTemplate;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['evaluation-templates'] });
            toast.success(t({ en: 'Template created', ar: 'تم إنشاء القالب' }));
            logAction({ action: 'create', entity_type: 'evaluation_template', entity_id: data.id, details: { name: data.template_name_en } });
        },
        onError: (error) => {
            console.error('Create template error:', error);
            toast.error(t({ en: 'Failed to create template', ar: 'فشل إنشاء القالب' }));
        }
    });

    const updateTemplate = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase.from('evaluation_templates').update(data).eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['evaluation-templates'] });
            toast.success(t({ en: 'Template updated', ar: 'تم تحديث القالب' }));
            logAction({ action: 'update', entity_type: 'evaluation_template', entity_id: id });
        },
        onError: (error) => {
            console.error('Update template error:', error);
            toast.error(t({ en: 'Failed to update template', ar: 'فشل تحديث القالب' }));
        }
    });

    const deleteTemplate = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('evaluation_templates').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['evaluation-templates'] });
            toast.success(t({ en: 'Template deleted', ar: 'تم حذف القالب' }));
            logAction({ action: 'delete', entity_type: 'evaluation_template', entity_id: id });
        },
        onError: (error) => {
            console.error('Delete template error:', error);
            toast.error(t({ en: 'Failed to delete template', ar: 'فشل حذف القالب' }));
        }
    });

    const createEvaluation = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('expert_evaluations').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expert-evaluations'] });
            queryClient.invalidateQueries({ queryKey: ['expert-assignments'] });
        }
    });

    const checkConsensus = useMutation({
        mutationFn: async ({ entityType, entityId }) => {
            await supabase.functions.invoke('checkConsensus', {
                body: {
                    entity_type: entityType,
                    entity_id: entityId
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return {
        createTemplate,
        updateTemplate,
        deleteTemplate,
        createEvaluation,
        checkConsensus
    };
}

/**
 * Hook for handling complex evaluation submission logic
 */
export function useSubmitEvaluation({ entityType, entityId, assignmentId, onComplete }) {
    const { createEvaluation } = useEvaluationMutations();
    const { triggerEmail } = useEmailTrigger();
    const { user } = useAuth();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async ({ scores, recommendation, feedbackText, strengths, weaknesses, improvements, conditions }) => {
            const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

            await createEvaluation.mutateAsync({
                expert_email: user?.email,
                assignment_id: assignmentId,
                entity_type: entityType,
                entity_id: entityId,
                evaluation_date: new Date().toISOString(),
                ...scores,
                overall_score: overallScore,
                recommendation,
                feedback_text: feedbackText,
                strengths: strengths.filter(s => s.trim()),
                weaknesses: weaknesses.filter(w => w.trim()),
                improvement_suggestions: improvements.filter(i => i.trim()),
                conditions: recommendation.includes('conditions') ? conditions.filter(c => c.trim()) : []
            });

            return { overallScore };
        },
        onSuccess: async ({ overallScore }, variables) => {
            const { recommendation } = variables;
            // Trigger evaluation completed email
            await triggerEmail('evaluation.completed', {
                entityType: entityType,
                entityId: entityId,
                variables: {
                    entity_type: entityType,
                    entity_id: entityId,
                    evaluator_email: user?.email,
                    recommendation: recommendation,
                    overall_score: overallScore.toFixed(1)
                }
            }).catch(err => console.error('Email trigger failed:', err));

            toast.success(t({ en: 'Evaluation submitted', ar: 'تم إرسال التقييم' }));
            if (onComplete) onComplete();
        }
    });
}

/**
 * Hook to invalidate evaluation queries
 */
export function useEvaluationInvalidator() {
    const queryClient = useQueryClient();
    return {
        invalidateEvaluations: () => {
            queryClient.invalidateQueries({ queryKey: ['expert-evaluations'] });
            queryClient.invalidateQueries({ queryKey: ['expert-assignments'] });
            queryClient.invalidateQueries({ queryKey: ['challenges-for-review'] });
            queryClient.invalidateQueries({ queryKey: ['challenges-with-visibility'] });
        },
        invalidateAll: () => queryClient.invalidateQueries()
    };
}


/**
 * Legacy support / Combined hook default export
 * While we transition, we can keep this for backward compatibility if needed, 
 * but best to switch to named exports.
 */
export function useEvaluations() {
    const templateMutations = useEvaluationMutations();
    // Re-wrapping them to match old structure if any
    return {
        useEvaluationTemplates,
        useTemplateMutations: () => templateMutations,
        useEvaluationsByEntity: (type, id) => useEvaluationsByEntity(type, id), // This mimics the bad pattern but uses the top level hook
        createEvaluation: templateMutations.createEvaluation,
        checkConsensus: templateMutations.checkConsensus.mutateAsync // Old hook returned mutateAsync directly
    };
}
