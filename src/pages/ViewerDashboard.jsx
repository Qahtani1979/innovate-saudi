import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Newspaper, 
  Calendar, 
  Lightbulb, 
  TestTube, 
  ArrowRight,
  TrendingUp,
  Building2,
  Award,
  UserPlus
} from 'lucide-react';
import RoleRequestStatusBanner from '@/components/profile/RoleRequestStatusBanner';

/**
 * ViewerDashboard - Simple dashboard for authenticated viewers (browse-only access)
 * Viewers can see public content but cannot participate (submit ideas, vote, etc.)
 * They can upgrade to Citizen or other personas through onboarding
 */
const ViewerDashboard = () => {
  const { t, language, isRTL } = useLanguage();

  // Fetch platform statistics
  const { data: stats } = useQuery({
    queryKey: ['viewer-platform-stats'],
    queryFn: async () => {
      const [challenges, pilots, solutions, municipalities] = await Promise.all([
        supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('pilots').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('municipalities').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);
      return {
        challenges: challenges.count || 0,
        pilots: pilots.count || 0,
        solutions: solutions.count || 0,
        municipalities: municipalities.count || 0
      };
    }
  });

  // Fetch recent news
  const { data: recentNews } = useQuery({
    queryKey: ['viewer-recent-news'],
    queryFn: async () => {
      const { data } = await supabase
        .from('news_articles')
        .select('id, title_en, title_ar, published_at, image_url')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      return data || [];
    }
  });

  // Fetch upcoming events
  const { data: upcomingEvents } = useQuery({
    queryKey: ['viewer-upcoming-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title_en, title_ar, start_date, location')
        .eq('is_published', true)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);
      return data || [];
    }
  });

  const quickLinks = [
    { icon: Newspaper, label: { en: 'Latest News', ar: 'آخر الأخبار' }, href: '/news', color: 'text-blue-500' },
    { icon: Calendar, label: { en: 'Events', ar: 'الفعاليات' }, href: '/events', color: 'text-green-500' },
    { icon: Lightbulb, label: { en: 'Ideas Board', ar: 'لوحة الأفكار' }, href: '/public-ideas', color: 'text-yellow-500' },
    { icon: TestTube, label: { en: 'Public Pilots', ar: 'التجارب العامة' }, href: '/public-pilots', color: 'text-purple-500' },
  ];

  const statCards = [
    { icon: Building2, value: stats?.municipalities || 0, label: { en: 'Municipalities', ar: 'البلديات' }, color: 'bg-emerald-500' },
    { icon: Lightbulb, value: stats?.challenges || 0, label: { en: 'Challenges', ar: 'التحديات' }, color: 'bg-amber-500' },
    { icon: TestTube, value: stats?.pilots || 0, label: { en: 'Pilots', ar: 'التجارب' }, color: 'bg-violet-500' },
    { icon: Award, value: stats?.solutions || 0, label: { en: 'Solutions', ar: 'الحلول' }, color: 'bg-rose-500' },
  ];

  return (
    <div className={`min-h-screen bg-background p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Role Request Status Banner */}
        <RoleRequestStatusBanner />

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ar' ? 'مرحباً بك في المنصة' : 'Welcome to the Platform'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'تصفح المحتوى العام واكتشف الابتكارات البلدية' 
                : 'Browse public content and discover municipal innovations'}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/onboarding">
              <UserPlus className="h-4 w-4" />
              {language === 'ar' ? 'ترقية حسابي' : 'Upgrade My Account'}
            </Link>
          </Button>
        </div>

        {/* Upgrade CTA Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {language === 'ar' ? 'هل تريد المشاركة؟' : 'Want to Participate?'}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {language === 'ar'
                    ? 'قم بترقية حسابك لتتمكن من إرسال الأفكار والتصويت والمشاركة في التجارب'
                    : 'Upgrade your account to submit ideas, vote, and participate in pilots'}
                </p>
              </div>
              <Button asChild variant="default">
                <Link to="/onboarding">
                  {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label[language]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'تصفح المحتوى المتاح' : 'Browse available content'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <link.icon className={`h-8 w-8 ${link.color} mb-2`} />
                  <span className="text-sm font-medium text-foreground text-center">
                    {link.label[language]}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent News & Events */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent News */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  {language === 'ar' ? 'آخر الأخبار' : 'Latest News'}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/news">
                  {language === 'ar' ? 'عرض الكل' : 'View All'}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentNews && recentNews.length > 0 ? (
                <div className="space-y-3">
                  {recentNews.map((news) => (
                    <div key={news.id} className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      {news.image_url && (
                        <img 
                          src={news.image_url} 
                          alt="" 
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {language === 'ar' ? news.title_ar : news.title_en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(news.published_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  {language === 'ar' ? 'لا توجد أخبار حالياً' : 'No news available'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {language === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/events">
                  {language === 'ar' ? 'عرض الكل' : 'View All'}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg border border-border">
                      <p className="font-medium text-sm text-foreground">
                        {language === 'ar' ? event.title_ar : event.title_en}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        {event.location && (
                          <>
                            <span>•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  {language === 'ar' ? 'لا توجد فعاليات قادمة' : 'No upcoming events'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
