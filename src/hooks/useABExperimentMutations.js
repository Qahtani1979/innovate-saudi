import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function useABExperimentMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const createExperiment = useMutation({
        mutationFn: async ({ name, description, variants, allocation_percentages, userEmail }) => {
            const { error } = await supabase.from('ab_experiments').insert({
                name,
                description,
                variants,
                allocation_percentages,
                status: 'draft',
                created_by: userEmail
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ab-experiments']);
            toast.success(t({ en: 'Experiment created!', ar: 'تم إنشاء التجربة!' }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const updateExperimentStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            const { error } = await supabase
                .from('ab_experiments')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ab-experiments']);
            toast.success(t({ en: 'Status updated!', ar: 'تم تحديث الحالة!' }));
        }
    });

    // Helper query for fetching all experiments (Admin view)
    const useAllExperiments = () => useQuery({
        queryKey: ['ab-experiments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ab_experiments')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    // Helper query for stats
    const useExperimentStats = (experiments) => useQuery({
        queryKey: ['ab-experiment-stats'],
        queryFn: async () => {
            const stats = {};
            if (!experiments || experiments.length === 0) return stats;

            for (const exp of experiments) {
                const { data: assignments } = await supabase
                    .from('ab_assignments')
                    .select('variant')
                    .eq('experiment_id', exp.id);

                const { data: conversions } = await supabase
                    .from('ab_conversions')
                    .select('*, ab_assignments(variant)')
                    .eq('experiment_id', exp.id);

                const variantStats = {};
                (exp.variants || ['control', 'treatment']).forEach(v => {
                    const variantAssignments = (assignments || []).filter(a => a.variant === v).length;
                    const variantConversions = (conversions || []).filter(c => c.ab_assignments?.variant === v).length;
                    variantStats[v] = {
                        participants: variantAssignments,
                        conversions: variantConversions,
                        rate: variantAssignments > 0 ? ((variantConversions / variantAssignments) * 100).toFixed(1) : 0
                    };
                });

                stats[exp.id] = {
                    totalParticipants: (assignments || []).length,
                    totalConversions: (conversions || []).length,
                    variants: variantStats
                };
            }
            return stats;
        },
        enabled: experiments && experiments.length > 0
    });

    return {
        createExperiment,
        updateExperimentStatus,
        useAllExperiments,
        useExperimentStats
    };
}
