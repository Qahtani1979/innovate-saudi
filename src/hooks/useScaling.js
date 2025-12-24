import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useScaling() {
    const queryClient = useQueryClient();

    const useCompletedPilots = (user) => useQuery({
        queryKey: ['completed-pilots', user?.email, user?.role],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .eq('stage', 'completed')
                .eq('recommendation', 'scale');
            return data || [];
        },
        enabled: !!user
    });

    const useScaledPilots = (user) => useQuery({
        queryKey: ['scaled-pilots', user?.email, user?.role],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .eq('stage', 'scaled');
            return data || [];
        },
        enabled: !!user
    });

    const useScalingPlans = () => useQuery({
        queryKey: ['scaling-plans'],
        queryFn: async () => {
            const { data } = await supabase.from('scaling_plans').select('*');
            return data || [];
        }
    });

    const useApproveScaling = () => useMutation({
        mutationFn: async ({ pilotId, plan }) => {
            const { error } = await supabase.from('pilots').update({
                stage: 'scaled',
                scaling_plan: plan,
                scaled_date: new Date().toISOString()
            }).eq('id', pilotId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['completed-pilots']);
            queryClient.invalidateQueries(['scaled-pilots']);
            toast.success('Pilot approved for scaling');
        }
    });

    return {
        useCompletedPilots,
        useScaledPilots,
        useScalingPlans,
        useApproveScaling
    };
}
