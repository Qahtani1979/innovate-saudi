import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for strategic plan mutations: update pillars, objectives, etc.
 */
export function useStrategicPlanMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    /**
     * Update strategic plan
     */
    const updatePlan = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('strategic_plans')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['strategic-plans']);
            queryClient.invalidateQueries(['strategic-plan', data.id]);
        }
    });

    return {
        updatePlan
    };
}
