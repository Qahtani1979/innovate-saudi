import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing strategic KPIs with fallback to plan objectives
 */
export function useStrategicKPIs(options = {}) {
    const { planIds = [], strategicPlans = [] } = options;
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['strategic-kpis', planIds],
        queryFn: async () => {
            // 1. Try to fetch from strategic_kpis table
            try {
                let q = supabase.from('strategic_kpis').select('*');
                if (planIds.length > 0) {
                    q = q.in('plan_id', planIds);
                }
                const { data, error } = await q;
                if (!error && data?.length > 0) return data;
            } catch (e) {
                console.warn('strategic_kpis table not available or error:', e);
            }

            // 2. Fallback: Extract from strategic plans
            if (strategicPlans.length > 0) {
                const linkedPlans = planIds.length > 0
                    ? strategicPlans.filter(p => planIds.includes(p.id))
                    : strategicPlans;

                const extractedKPIs = [];
                linkedPlans.forEach(plan => {
                    const objectives = (plan.objectives || plan.strategic_objectives || []);
                    objectives.forEach((obj, i) => {
                        extractedKPIs.push({
                            id: `${plan.id}-kpi-${i}`,
                            plan_id: plan.id,
                            name_en: typeof obj === 'object' ? obj.name_en || obj.title || obj.title_en : obj,
                            name_ar: typeof obj === 'object' ? obj.name_ar || obj.title_ar : null,
                            target: typeof obj === 'object' ? obj.target || 100 : 100,
                            current: typeof obj === 'object' ? obj.current || 0 : 0,
                            unit: typeof obj === 'object' ? obj.unit || '%' : '%'
                        });
                    });
                });
                return extractedKPIs;
            }

            return [];
        },
        enabled: true
    });

    const recordContributionMutation = useMutation({
        mutationFn: async ({ kpiId, contribution, programId, currentKpi }) => {
            // Currently only supports updating the table if it exists
            const { error } = await supabase
                .from('strategic_kpis')
                .update({
                    current: (currentKpi.current || 0) + contribution,
                    last_updated: new Date().toISOString(),
                    contributing_programs: [...(currentKpi.contributing_programs || []), programId]
                })
                .eq('id', kpiId);

            if (error) throw error;
            return { kpiId, contribution };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategic-kpis'] });
        }
    });

    return {
        kpis: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        recordContribution: recordContributionMutation.mutateAsync,
        isRecording: recordContributionMutation.isPending
    };
}
