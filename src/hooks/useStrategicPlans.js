import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch strategic plans
 * @param {Object} options
 * @param {string|string[]} options.status - Filter by status (e.g. 'active', 'draft')
 */
export function useStrategicPlans(options = {}) {
    const { status } = options;

    return useQuery({
        queryKey: ['strategic-plans', status],
        queryFn: async () => {
            let query = supabase
                .from('strategic_plans')
                .select('*')
                .or('is_template.is.null,is_template.eq.false')
                .or('is_deleted.is.null,is_deleted.eq.false');

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch a single strategic plan by ID
 * @param {string} id 
 */
export function useStrategicPlan(id) {
    return useQuery({
        queryKey: ['strategic-plan', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}
