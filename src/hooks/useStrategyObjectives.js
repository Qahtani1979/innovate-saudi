import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStrategyObjectives = ({ planId } = {}) => {
    return useQuery({
        queryKey: ['strategic-objectives', { planId }],
        queryFn: async () => {
            let query = supabase
                .from('strategic_objectives')
                .select('*')
                .order('created_at', { ascending: true });

            if (planId) {
                query = query.eq('strategic_plan_id', planId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
