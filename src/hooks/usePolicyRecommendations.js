import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePolicyRecommendations(challengeId) {
    return useQuery({
        queryKey: ['policy-recommendations', challengeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('policy_recommendations')
                .select('*')
                .eq('challenge_id', challengeId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!challengeId
    });
}
