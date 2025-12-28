import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useScaling() {
    const queryClient = useAppQueryClient();

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
        /** @param {{ pilotId: string, plan: any }} variables */
        mutationFn: async ({ pilotId, plan }) => {
            const { error } = await supabase.from('pilots').update({
                stage: 'scaled',
                scaling_plan: plan,
                scaled_date: new Date().toISOString()
            }).eq('id', pilotId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['completed-pilots'] });
            queryClient.invalidateQueries({ queryKey: ['scaled-pilots'] });
            toast.success('Pilot approved for scaling');
        }
    });

    const useTriggerPolicyRecommendation = () => useMutation({
        /** @param {{ pilotId: string, scalingResult: string, lessonsLearned: any }} variables */
        mutationFn: async ({ pilotId, scalingResult, lessonsLearned }) => {
            const { data: pilot } = /** @type {any} */ (await supabase.from('pilots').select('*').eq('id', pilotId).single());
            const recommendation = {
                title_en: `Policy Reform: ${pilot.title_en} Scaling`,
                description_en: `Automatically generated from successful scaling of ${pilot.title_en}. Scaling result: ${scalingResult}`,
                source_entity_type: 'Pilot',
                source_entity_id: pilotId,
                supporting_evidence: {
                    lessons_learned: lessonsLearned,
                    scaling_result: scalingResult,
                    original_pilot_id: pilotId
                },
                status: 'draft',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('policy_recommendations').insert(recommendation);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policy-recommendations'] });
            toast.success('Policy recommendation generated from scaling success');
        }
    });

    return {
        useCompletedPilots,
        useScaledPilots,
        useScalingPlans,
        useApproveScaling,
        useTriggerPolicyRecommendation,
        invalidateScalingPlans: () => queryClient.invalidateQueries({ queryKey: ['scaling-plans'] })
    };
}

