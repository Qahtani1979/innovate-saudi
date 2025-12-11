import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Trophy, Award, Star, TrendingUp, Users, Zap, Target, Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/AuthContext';

export default function UserGamification() {
  const { t, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await supabase.from('achievements').select('*');
      return data || [];
    }
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', currentUser?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_email', currentUser?.email);
      return data || [];
    },
    enabled: !!currentUser?.email
  });

  const { data: allUserAchievements = [] } = useQuery({
    queryKey: ['all-user-achievements'],
    queryFn: async () => {
      const { data } = await supabase.from('user_achievements').select('*');
      return data || [];
    }
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async () => {
      const { data } = await supabase.from('user_activities').select('*').order('created_at', { ascending: false }).limit(1000);
      return data || [];
    }
  });

  // Calculate user points and rank
  const userPoints = userAchievements.reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievement_id);
    return sum + (achievement?.points || 0);
  }, 0);

  // Leaderboard
  const leaderboard = users.map(user => {
    const userAchs = allUserAchievements.filter(ua => ua.user_email === user.email);
    const points = userAchs.reduce((sum, ua) => {
      const achievement = achievements.find(a => a.id === ua.achievement_id);
      return sum + (achievement?.points || 0);
    }, 0);
    const activityCount = activities.filter(a => a.user_email === user.email).length;
    
    return {
      ...user,
      points,
      achievementCount: userAchs.length,
      activityCount
    };
  }).sort((a, b) => b.points - a.points);

  const currentUserRank = leaderboard.findIndex(u => u.email === currentUser?.email) + 1;

  const rarityColors = {
    common: 'bg-slate-100 text-slate-700 border-slate-300',
    rare: 'bg-blue-100 text-blue-700 border-blue-300',
    epic: 'bg-purple-100 text-purple-700 border-purple-300',
    legendary: 'bg-amber-100 text-amber-700 border-amber-300'
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
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🏆 Achievements & Leaderboard', ar: '🏆 الإنجازات ولوحة المتصدرين' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Track your progress and compete with your peers', ar: 'تتبع تقدمك وتنافس مع أقرانك' })}
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">{userPoints}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Points', ar: 'إجمالي النقاط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{userAchievements.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Achievements', ar: 'الإنجازات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">#{currentUserRank}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Rank', ar: 'الترتيب' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">
              {activities.filter(a => a.user_email === currentUser?.email).length}
            </p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Activities', ar: 'الأنشطة' })}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            {t({ en: 'My Achievements', ar: 'إنجازاتي' })}
          </TabsTrigger>
          <TabsTrigger value="available">
            <Target className="h-4 w-4 mr-2" />
            {t({ en: 'Available', ar: 'المتاحة' })}
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            {t({ en: 'Leaderboard', ar: 'المتصدرون' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAchievements.map((ua) => {
              const achievement = achievements.find(a => a.id === ua.achievement_id);
              if (!achievement) return null;

              const CategoryIcon = categoryIcons[achievement.category] || Star;

              return (
                <Card key={ua.id} className={`border-2 ${rarityColors[achievement.rarity]}`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{achievement.icon || '🏅'}</div>
                      <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Badge className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          {achievement.points} pts
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {t({ en: 'Earned', ar: 'حصل عليه' })}: {new Date(ua.earned_date || ua.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {userAchievements.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">
                  {t({ en: 'No achievements yet. Start contributing to earn your first badge!', ar: 'لا توجد إنجازات بعد. ابدأ المساهمة للحصول على أول شارة!' })}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.filter(a => !userAchievements.some(ua => ua.achievement_id === a.id)).map((achievement) => {
              const CategoryIcon = categoryIcons[achievement.category] || Star;

              return (
                <Card key={achievement.id} className="border hover:shadow-lg transition-shadow opacity-75">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2 opacity-50">{achievement.icon || '🏅'}</div>
                      <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          {achievement.points} pts
                        </Badge>
                      </div>
                      {achievement.criteria && (
                        <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600">
                          {t({ en: 'Requirement:', ar: 'المتطلب:' })} {achievement.criteria.action_type} ({achievement.criteria.threshold}x)
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                {t({ en: 'Top Contributors', ar: 'أفضل المساهمين' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 20).map((user, idx) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      user.email === currentUser?.email ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {idx < 3 ? (idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉') : `#${idx + 1}`}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{user.full_name}</p>
                      <p className="text-sm text-slate-600">{user.job_title || user.role}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{user.points}</p>
                      <p className="text-xs text-slate-500">{user.achievementCount} {t({ en: 'badges', ar: 'شارة' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}