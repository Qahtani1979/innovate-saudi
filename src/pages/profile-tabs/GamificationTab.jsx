import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Trophy, Award, Star, Medal, Target, Zap, Users } from 'lucide-react';
import { ProfileStatCard, ProfileStatGrid } from '@/components/profile/ProfileStatCard';

export default function GamificationTab() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();

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

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('citizen_points')
        .select('user_email, points, level')
        .order('points', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  // Calculate stats
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const ach = achievements.find(a => a.id === ua.achievement_id);
    return sum + (ach?.points || 0);
  }, 0) + (citizenPoints?.points || 0);

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const earnedCount = userAchievements.length + citizenBadges.length;
  const currentRank = leaderboardData.findIndex(l => l.user_email === user?.email) + 1;
  const userLevel = citizenPoints?.level || Math.floor(totalPoints / 100) + 1;

  const rarityStyles = {
    common: 'border-border bg-muted/50',
    rare: 'border-primary/30 bg-primary/5',
    epic: 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20',
    legendary: 'border-warning/30 bg-warning/5'
  };

  const categoryIcons = {
    challenge: Target,
    pilot: Zap,
    collaboration: Users,
    learning: Award,
    contribution: Star,
    milestone: Medal
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats */}
      <ProfileStatGrid columns={4}>
        <ProfileStatCard
          icon={Trophy}
          value={totalPoints}
          label={t({ en: 'Total Points', ar: 'إجمالي النقاط' })}
          variant="amber"
        />
        <ProfileStatCard
          icon={Award}
          value={earnedCount}
          label={t({ en: 'Achievements', ar: 'الإنجازات' })}
          variant="primary"
        />
        <ProfileStatCard
          icon={Medal}
          value={currentRank > 0 ? `#${currentRank}` : '-'}
          label={t({ en: 'Rank', ar: 'الترتيب' })}
          variant="purple"
        />
        <ProfileStatCard
          icon={Star}
          value={`Lv.${userLevel}`}
          label={t({ en: 'Level', ar: 'المستوى' })}
          variant="success"
        />
      </ProfileStatGrid>

      <Tabs defaultValue="earned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned" className="text-sm">
            <Award className="h-4 w-4 mr-2" />
            {t({ en: 'Earned', ar: 'المكتسبة' })}
          </TabsTrigger>
          <TabsTrigger value="available" className="text-sm">
            <Target className="h-4 w-4 mr-2" />
            {t({ en: 'Available', ar: 'المتاحة' })}
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-sm">
            <Trophy className="h-4 w-4 mr-2" />
            {t({ en: 'Leaderboard', ar: 'المتصدرون' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userAchievements.map((ua) => {
              const achievement = achievements.find(a => a.id === ua.achievement_id);
              if (!achievement) return null;
              const CategoryIcon = categoryIcons[achievement.category] || Star;

              return (
                <Card key={ua.id} className={`border-2 ${rarityStyles[achievement.rarity || 'common']}`}>
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl mb-2">{achievement.icon || '🏅'}</div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'ar' ? achievement.name_ar : achievement.name_en}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {language === 'ar' ? achievement.description_ar : achievement.description_en}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(ua.earned_date || ua.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {citizenBadges.map((badge, i) => (
              <Card key={`badge-${i}`} className="border-2 border-warning/30 bg-warning/5">
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl mb-2">🎖️</div>
                  <h4 className="font-medium text-sm mb-1">{badge.badge_name || badge.badge_type}</h4>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}

            {earnedCount === 0 && (
              <div className="col-span-full text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {t({ en: 'No achievements yet. Start contributing!', ar: 'لا توجد إنجازات بعد. ابدأ المساهمة!' })}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements
              .filter(a => !earnedAchievementIds.has(a.id))
              .map((achievement) => (
                <Card key={achievement.id} className="border opacity-60 hover:opacity-100 transition-opacity">
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl mb-2 grayscale">{achievement.icon || '🏅'}</div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'ar' ? achievement.name_ar : achievement.name_en}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {language === 'ar' ? achievement.description_ar : achievement.description_en}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {achievement.points} pts
                    </Badge>
                  </CardContent>
                </Card>
              ))}

            {achievements.filter(a => !earnedAchievementIds.has(a.id)).length === 0 && (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-12 w-12 text-warning mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {t({ en: 'You\'ve earned all achievements! 🎉', ar: 'لقد حصلت على جميع الإنجازات! 🎉' })}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                {t({ en: 'Top Contributors', ar: 'أفضل المساهمين' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboardData.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      entry.user_email === user?.email ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx < 3 ? (idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉') : `#${idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {entry.user_email === user?.email 
                          ? entry.user_email 
                          : entry.user_email?.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {entry.level || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-warning">{entry.points}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                ))}

                {leaderboardData.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {t({ en: 'No leaderboard data yet', ar: 'لا توجد بيانات بعد' })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
