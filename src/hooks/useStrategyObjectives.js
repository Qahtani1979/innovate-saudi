import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStrategyObjectives = ({ planId } = {}) => {
    return useQuery({
        queryKey: ['strategic-objectives', { planId }],
        queryFn: async () => {
            let query = supabase
                .from('strategic_objectives')
                .select('*')
                .order('display_order', { ascending: true }); // Changed to display_order

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

export const useUpdateObjectivePriorities = () => {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ updates, planId }) => {
            const promises = updates.map(item =>
                supabase
                    .from('strategic_objectives')
                    .update({
                        display_order: item.display_order,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id)
            );

            const results = await Promise.all(promises);
            const errors = results.filter(r => r.error);
            if (errors.length > 0) throw errors[0].error;

            return updates;
        },
        onSuccess: (_, { planId }) => {
            queryClient.invalidateQueries({ queryKey: ['strategic-objectives', { planId }] });
            // Also invalidate the old key used in component temporarily till full refactor spread
            queryClient.invalidateQueries({ queryKey: ['strategy-objectives-for-reprioritize'] });
            toast.success('Priorities updated successfully');
        },
        onError: (error) => {
            console.error('Failed to update priorities:', error);
            toast.error('Failed to update priorities');
        }
    });
};

