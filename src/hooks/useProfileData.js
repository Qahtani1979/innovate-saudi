import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function useProfileData() {
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
    enabled: !!user?.id
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await supabase.from('achievements').select('*').eq('is_active', true);
      return data || [];
    }
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
    enabled: !!user?.email
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
    enabled: !!user?.email
  });

  const { data: citizenPoints } = useQuery({
    queryKey: ['citizen-points', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data } = await supabase
        .from('citizen_points')
        .select('*')
        .eq('user_email', user.email)
        .single();
      return data;
    },
    enabled: !!user?.email
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
    enabled: !!user?.email
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

export default useProfileData;
