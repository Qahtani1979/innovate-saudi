import React, { Suspense, lazy } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Lightbulb, Heart, TrendingUp, Trophy, Star, Calendar, TestTube, Newspaper, Loader2
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

// Lazy load to avoid React initialization timing issues
const FirstActionRecommender = lazy(() => import('../components/onboarding/FirstActionRecommender'));

function CitizenDashboard() {
  const { user } = useAuth();
  const { language, isRTL, t } = useLanguage();

  // Fetch citizen stats
  const { data: stats } = useQuery({
    queryKey: ['citizen-stats', user?.id],
    queryFn: async () => {
      const [ideasRes, votesRes, pointsRes] = await Promise.all([
        supabase.from('citizen_ideas').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('citizen_votes').select('id', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('citizen_points').select('*').eq('user_id', user?.id).maybeSingle()
      ]);
      return {
        ideasCount: ideasRes.count || 0,
        votesCount: votesRes.count || 0,
        points: pointsRes.data?.points || 0,
        level: pointsRes.data?.level || 1
      };
    },
    enabled: !!user?.id
  });

  // Fetch recent public challenges
  const { data: recentChallenges = [] } = useQuery({
    queryKey: ['public-challenges-preview'],
    queryFn: async () => {
      const { data } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, category, status')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    }
  });

  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events-preview'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title_en, title_ar, start_date, event_type')
        .gte('start_date', new Date().toISOString())
        .eq('is_published', true)
        .order('start_date')
        .limit(3);
      return data || [];
    }
  });

  const quickActions = [
    { name: 'CitizenIdeaSubmission', icon: Lightbulb, label: t({ en: 'Submit Idea', ar: 'إرسال فكرة' }), color: 'from-purple-500 to-pink-500' },
    { name: 'PublicIdeasBoard', icon: Star, label: t({ en: 'Vote on Ideas', ar: 'صوت للأفكار' }), color: 'from-amber-500 to-orange-500' },
    { name: 'PublicPilotTracker', icon: TestTube, label: t({ en: 'Join Pilots', ar: 'انضم للتجارب' }), color: 'from-teal-500 to-cyan-500' },
    { name: 'EventCalendar', icon: Calendar, label: t({ en: 'View Events', ar: 'عرض الفعاليات' }), color: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t({ en: 'Welcome Back!', ar: 'مرحباً بعودتك!' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Your civic participation hub', ar: 'مركز مشاركتك المدنية' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Ideas', ar: 'الأفكار' })}</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.ideasCount || 0}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Votes', ar: 'الأصوات' })}</p>
                <p className="text-2xl font-bold text-pink-600">{stats?.votesCount || 0}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Points', ar: 'النقاط' })}</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.points || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Level', ar: 'المستوى' })}</p>
                <p className="text-2xl font-bold text-teal-600">{stats?.level || 1}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI First Action Recommender */}
      <Suspense fallback={
        <Card className="border-2 border-purple-300">
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </CardContent>
        </Card>
      }>
        <FirstActionRecommender user={{ role: 'citizen', email: user?.email || '' }} />
      </Suspense>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.name} to={createPageUrl(action.name)}>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white hover:shadow-lg transition-shadow cursor-pointer`}>
                  <action.icon className="h-8 w-8 mb-2" />
                  <p className="font-medium text-sm">{action.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Challenges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t({ en: 'Active Challenges', ar: 'التحديات النشطة' })}</CardTitle>
            <Link to={createPageUrl('PublicChallenges')}>
              <Button variant="ghost" size="sm">{t({ en: 'View All', ar: 'عرض الكل' })}</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentChallenges.length > 0 ? (
              recentChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{language === 'ar' ? challenge.title_ar : challenge.title_en}</p>
                    <Badge variant="outline" className="mt-1">{challenge.category}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t({ en: 'No active challenges', ar: 'لا توجد تحديات نشطة' })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t({ en: 'Upcoming Events', ar: 'الفعاليات القادمة' })}</CardTitle>
            <Link to={createPageUrl('EventCalendar')}>
              <Button variant="ghost" size="sm">{t({ en: 'View All', ar: 'عرض الكل' })}</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{language === 'ar' ? event.title_ar : event.title_en}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{event.event_type}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t({ en: 'No upcoming events', ar: 'لا توجد فعاليات قادمة' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(CitizenDashboard, { requiredPermissions: [] });