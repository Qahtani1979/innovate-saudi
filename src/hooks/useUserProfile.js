/**
 * User Profile Hook - GOLD STANDARD
 * 
 * Comprehensive hook for all user profile operations
 * Consolidates: useUserProfiles, useProfileData, useUserProfileManagement
 * 
 * @module useUserProfile
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to fetch a user profile by email
 * @param {string} email - The email address of the user
 * @param {object} options - Additional query options
 * @returns {object} React Query result with user profile data
 */
export function useUserProfile(email, options = {}) {
    return useQuery({
        queryKey: ['user-profile-by-email', email],
        queryFn: async () => {
            if (!email) return null;

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_email', email)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!email,
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options
    });
}

/**
 * Hook to fetch a user profile by user ID
 * @param {string} userId - The user ID
 * @param {object} options - Additional query options
 * @returns {object} React Query result with user profile data
 */
export function useUserProfileById(userId, options = {}) {
    return useQuery({
        queryKey: ['user-profile-by-id', userId],
        queryFn: async () => {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options
    });
}

/**
 * Hook to fetch all user profiles (admin use)
 * @returns {object} React Query result with all user profiles
 */
export function useAllUserProfiles() {
    return useQuery({
        queryKey: ['all-user-profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('user_id, email, full_name, created_at');

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to fetch current user's complete profile data
 * Includes profile, achievements, activities, points, and badges
 * @returns {object} Comprehensive profile data for current user
 */
export function useCurrentUserProfile() {
    const { user } = useAuth();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5
    });

    const { data: achievements = [] } = useQuery({
        queryKey: ['achievements'],
        queryFn: async () => {
            const { data } = await supabase
                .from('achievements')
                .select('*')
                .eq('is_active', true);
            return data || [];
        },
        staleTime: 1000 * 60 * 10 // 10 minutes - achievements don't change often
    });

    const { data: userAchievements = [] } = useQuery({
        queryKey: ['user-achievements', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_email', user.email);
            return data || [];
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 5
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['user-activities', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data } = await supabase
                .from('user_activities')
                .select('*')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false })
                .limit(100);
            return data || [];
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 2 // 2 minutes - activities update frequently
    });

    const { data: citizenPoints } = useQuery({
        queryKey: ['citizen-points', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const { data } = await supabase
                .from('citizen_points')
                .select('*')
                .eq('user_email', user.email)
                .maybeSingle();
            return data;
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 5
    });

    const { data: citizenBadges = [] } = useQuery({
        queryKey: ['citizen-badges', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data } = await supabase
                .from('citizen_badges')
                .select('*')
                .eq('user_email', user.email);
            return data || [];
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 5
    });

    // Calculate stats
    const userPoints = userAchievements.reduce((sum, ua) => {
        const achievement = achievements.find(a => a.id === ua.achievement_id);
        return sum + (achievement?.points || 0);
    }, 0) + (citizenPoints?.points || 0);

    const userLevel = Math.floor(userPoints / 100) + 1;
    const pointsToNextLevel = ((userLevel) * 100) - userPoints;
    const levelProgress = (userPoints % 100);

    const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));

    return {
        profile,
        profileLoading,
        achievements,
        userAchievements,
        activities,
        citizenPoints,
        citizenBadges,
        userPoints,
        userLevel,
        pointsToNextLevel,
        levelProgress,
        earnedAchievementIds,
        user
    };
}

// Backward compatibility exports
export const useUserProfiles = useUserProfile;
export const useProfileData = useCurrentUserProfile;
export const useUserProfileManagement = useUserProfileById;

export default useUserProfile;

