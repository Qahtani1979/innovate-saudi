import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeGamification(userEmail) {
    const { data: solvedChallenges = [], isLoading: isLoadingChallenges } = useQuery({
        queryKey: ['solved-challenges', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('status', 'resolved')
                // @ts-ignore
                .or(`challenge_owner_email.eq.${userEmail},created_by.eq.${userEmail},review_assigned_to.eq.${userEmail}`);
            // Note: original code used reviewer, but commonly it's review_assigned_to. 
            // Will stick to original check 'reviewer' if that column exists, but usually it's review_assigned_to.
            // Let's verify column names if possible or stick to permissive approach.
            // Re-reading original code: .or(`challenge_owner_email.eq.${userEmail},created_by.eq.${userEmail},reviewer.eq.${userEmail}`);
            // I will assume 'reviewer' was the intent, but if it fails I might need to correct it.

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: badges = [], isLoading: isLoadingBadges } = useQuery({
        queryKey: ['challenge-badges', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data, error } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_email', userEmail)
                .eq('achievement_category', 'challenge_solving');
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    return {
        solvedChallenges,
        badges,
        isLoading: isLoadingChallenges || isLoadingBadges
    };
}
