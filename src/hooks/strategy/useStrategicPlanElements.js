/**
 * Hook for fetching Strategic Plan Elements (Objectives, KPIs)
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useStrategicPlanElements(strategicPlanId) {

    // Fetch Objectives
    const { data: objectives = [], isLoading: objectivesLoading } = useQuery({
        queryKey: ['strategic-objectives', strategicPlanId],
        queryFn: async () => {
            if (!strategicPlanId) return [];
            const { data, error } = await supabase
                .from('strategic_objectives')
                .select('id, title_en, title_ar, target_value, current_value')
                .eq('strategic_plan_id', strategicPlanId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!strategicPlanId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Fetch KPIs
    const { data: kpis = [], isLoading: kpisLoading } = useQuery({
        queryKey: ['strategy-kpis', strategicPlanId],
        queryFn: async () => {
            if (!strategicPlanId) return [];
            const { data, error } = await supabase
                .from('strategy_kpis')
                .select('id, name_en, name_ar, target_value, current_value, unit')
                .eq('strategic_plan_id', strategicPlanId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!strategicPlanId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        objectives,
        objectivesLoading,
        kpis,
        kpisLoading
    };
}

