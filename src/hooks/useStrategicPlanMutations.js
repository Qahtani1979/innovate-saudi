import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook for strategic plan mutations: update pillars, objectives, etc.
 */
export function useStrategicPlanMutations() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { notify } = useNotificationSystem();

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

            // Notification: Strategic Plan Updated
            notify({
                type: 'strategic_plan_updated',
                entityType: 'strategic_plan',
                entityId: data.id,
                recipientEmails: [], // Strategic Planning Team
                title: 'Strategic Plan Updated',
                message: 'Strategic plan details have been updated.',
                sendEmail: false
            });
        }
    });

    return {
        updatePlan
    };
}

