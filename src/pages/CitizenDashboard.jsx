import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Lightbulb, Heart, TrendingUp, Trophy, Star, Calendar, TestTube, LayoutDashboard
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import FirstActionRecommender from '../components/onboarding/FirstActionRecommender';
import { CitizenPageLayout, CitizenPageHeader } from '@/components/citizen/CitizenPageLayout';
import { useCitizenStats } from '@/hooks/useCitizenData';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useEventsWithVisibility } from '@/hooks/useEventsWithVisibility';

function CitizenDashboard() {
  const { user } = useAuth();
  const { language, isRTL, t } = useLanguage();

  // Fetch citizen stats
  const { data: stats } = useCitizenStats();

  // Fetch recent public challenges
  const { data: recentChallenges = [] } = useChallengesWithVisibility({
    publishedOnly: true,
    limit: 3
  });

  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useEventsWithVisibility({
    upcoming: true,
    limit: 3
  });

  const quickActions = [
    { name: 'CitizenIdeaSubmission', icon: Lightbulb, label: t({ en: 'Submit Idea', ar: 'إرسال فكرة' }), color: 'from-purple-500 to-pink-500' },
    { name: 'PublicIdeasBoard', icon: Star, label: t({ en: 'Vote on Ideas', ar: 'صوت للأفكار' }), color: 'from-amber-500 to-orange-500' },
    { name: 'PublicPilotTracker', icon: TestTube, label: t({ en: 'Join Pilots', ar: 'انضم للتجارب' }), color: 'from-teal-500 to-cyan-500' },
    { name: 'EventCalendar', icon: Calendar, label: t({ en: 'View Events', ar: 'عرض الفعاليات' }), color: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={LayoutDashboard}
        title={t({ en: 'Welcome Back!', ar: 'مرحباً بعودتك!' })}
        subtitle={null}
        description={t({ en: 'Your civic participation hub', ar: 'مركز مشاركتك المدنية' })}
        action={null}
        actions={null}
        children={null}
        stats={[
          { icon: Lightbulb, value: stats?.ideasCount || 0, label: t({ en: 'Ideas', ar: 'الأفكار' }) },
          { icon: Heart, value: stats?.votesCount || 0, label: t({ en: 'Votes', ar: 'الأصوات' }) },
          { icon: Trophy, value: stats?.points || 0, label: t({ en: 'Points', ar: 'النقاط' }) },
          { icon: TrendingUp, value: stats?.level || 1, label: t({ en: 'Level', ar: 'المستوى' }) },
        ]}
      />


      {/* AI First Action Recommender */}
      <FirstActionRecommender user={{ role: 'citizen', email: user?.email || '' }} />

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
    </CitizenPageLayout>
  );
}

export default ProtectedPage(CitizenDashboard, { requiredPermissions: [] });
