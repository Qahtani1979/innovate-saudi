import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch user progress data including profile, activities, and achievements
 */
export function useUserProgress(userId, userEmail) {
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile-progress', userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            return data;
        },
        enabled: !!userId
    });

    const { data: activities = [], isLoading: activitiesLoading } = useQuery({
        queryKey: ['progress-activities', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('user_activities')
                .select('*')
                .eq('user_email', userEmail);
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
        queryKey: ['progress-achievements', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('user_achievements')
                .select('*, achievement:achievements(*)')
                .eq('user_email', userEmail);
            return data || [];
        },
        enabled: !!userEmail
    });

    return {
        profile,
        activities,
        achievements,
        isLoading: profileLoading || activitiesLoading || achievementsLoading
    };
}

export default useUserProgress;

