import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStartupReferrals(startupId, userEmail) {
    return useQuery({
        queryKey: ['startup-referrals', startupId, userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_activities')
                .select('*')
                .eq('activity_type', 'startup_referral')
                .eq('entity_id', startupId)
                .eq('user_email', userEmail);

            if (error) throw error;
            return data || [];
        },
        enabled: !!startupId && !!userEmail
    });
}

export function useStartupReferralMutations() {
    const queryClient = useQueryClient();

    const sendReferral = useMutation({
        /**
         * @param {{ startupId: string, userEmail: string, referralEmail: string }} params
         */
        mutationFn: async ({ startupId, userEmail, referralEmail }) => {
            const { error } = await supabase.from('user_activities').insert({
                user_email: userEmail,
                activity_type: 'startup_referral',
                entity_type: 'StartupProfile',
                entity_id: startupId,
                metadata: { referred_email: referralEmail }
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['startup-referrals'] });
            toast.success('Referral sent successfully');
        },
        onError: (error) => {
            console.error('Failed to send referral:', error);
            toast.error('Failed to send referral');
        }
    });

    return { sendReferral };
}
