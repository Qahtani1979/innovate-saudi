import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching gamification achievements
 */
export function useAchievements(options = {}) {
    const { isActive = true } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['achievements', { isActive }],
        queryFn: async () => {
            let query = supabase
                .from('achievements')
                .select('*')
                .order('points', { ascending: false });

            query = applyVisibilityRules(query, 'achievement');

            if (isActive !== undefined) {
                query = query.eq('is_active', isActive);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook for fetching user achievements
 */
export function useUserAchievements(userEmail) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['user-achievements', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];

            let query = supabase
                .from('user_achievements')
                .select('*')
                .eq('user_email', userEmail)
                .order('earned_date', { ascending: false });

            query = applyVisibilityRules(query, 'user_achievement');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching citizen points
 */
export function useCitizenPoints(userEmail) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['citizen-points', userEmail],
        queryFn: async () => {
            if (!userEmail) return null;

            let query = supabase
                .from('citizen_points')
                .select('*')
                .eq('user_email', userEmail)
                .maybeSingle();

            query = applyVisibilityRules(query, 'citizen_point');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook for fetching citizen badges
 */
export function useCitizenBadges(userEmail) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['citizen-badges', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];

            let query = supabase
                .from('citizen_badges')
                .select('*')
                .eq('user_email', userEmail)
                .order('earned_at', { ascending: false });

            query = applyVisibilityRules(query, 'citizen_badge');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching leaderboard
 */
export function useLeaderboard(options = {}) {
    const { limit = 10 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['leaderboard', { limit }],
        queryFn: async () => {
            let query = supabase
                .from('citizen_points')
                .select('user_email, points, level')
                .order('points', { ascending: false })
                .limit(limit);

            query = applyVisibilityRules(query, 'citizen_point');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export default useAchievements;
