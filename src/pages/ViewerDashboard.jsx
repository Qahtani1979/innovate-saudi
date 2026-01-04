import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import {
  Newspaper,
  Calendar,
  Lightbulb,
  TestTube,
  ArrowRight,
  Building2,
  Award,
  UserPlus,
  Eye
} from 'lucide-react';
import RoleRequestStatusBanner from '@/components/profile/RoleRequestStatusBanner';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';
import ProtectedPage from '../components/permissions/ProtectedPage';

/**
 * ViewerDashboard - Simple dashboard for authenticated viewers (browse-only access)
 * Viewers can see public content but cannot participate (submit ideas, vote, etc.)
 * They can upgrade to Citizen or other personas through onboarding
 */
const ViewerDashboard = () => {
  const { t, language, isRTL } = useLanguage();

  // Fetch platform statistics
  const { usePlatformStats, useNews } = useContent();
  const { useEvents } = useMatchingEntities();

  const { data: stats } = usePlatformStats();
  const { data: recentNews } = useNews(3);
  const { data: upcomingEvents } = useEvents({ limit: 3, published: true, future: true });

  const quickLinks = [
    { icon: Newspaper, label: { en: 'Latest News', ar: 'آخر الأخبار' }, href: '/news', color: 'text-blue-500' },
    { icon: Calendar, label: { en: 'Events', ar: 'الفعاليات' }, href: '/events', color: 'text-green-500' },
    { icon: Lightbulb, label: { en: 'Ideas Board', ar: 'لوحة الأفكار' }, href: '/public-ideas', color: 'text-yellow-500' },
    { icon: TestTube, label: { en: 'Public Pilots', ar: 'التجارب العامة' }, href: '/public-pilots', color: 'text-purple-500' },
  ];

  return (
    <PageLayout>
      <PageHeader
        icon={Eye}
        title={t({ en: 'Welcome to the Platform', ar: 'مرحباً بك في المنصة' })}
        description={t({ en: 'Browse public content and discover municipal innovations', ar: 'تصفح المحتوى العام واكتشف الابتكارات البلدية' })}
        stats={[
          { icon: Building2, value: stats?.municipalities || 0, label: t({ en: 'Municipalities', ar: 'البلديات' }) },
          { icon: Lightbulb, value: stats?.challenges || 0, label: t({ en: 'Challenges', ar: 'التحديات' }) },
          { icon: TestTube, value: stats?.pilots || 0, label: t({ en: 'Pilots', ar: 'التجارب' }) },
          { icon: Award, value: stats?.solutions || 0, label: t({ en: 'Solutions', ar: 'الحلول' }) },
        ]}
        action={
          <Link to="/onboarding">
            <PersonaButton>
              <UserPlus className="h-4 w-4 mr-2" />
              {t({ en: 'Upgrade My Account', ar: 'ترقية حسابي' })}
            </PersonaButton>
          </Link>
        }
      />

      {/* Role Request Status Banner */}
      <RoleRequestStatusBanner />

      {/* Upgrade CTA Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t({ en: 'Want to Participate?', ar: 'هل تريد المشاركة؟' })}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {t({ en: 'Upgrade your account to submit ideas, vote, and participate in pilots', ar: 'قم بترقية حسابك لتتمكن من إرسال الأفكار والتصويت والمشاركة في التجارب' })}
              </p>
            </div>
            <Button asChild variant="default">
              <Link to="/onboarding">
                {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Quick Links', ar: 'روابط سريعة' })}</CardTitle>
          <CardDescription>
            {t({ en: 'Browse available content', ar: 'تصفح المحتوى المتاح' })}
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
                {t({ en: 'Latest News', ar: 'آخر الأخبار' })}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/news">
                {t({ en: 'View All', ar: 'عرض الكل' })}
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
                {t({ en: 'No news available', ar: 'لا توجد أخبار حالياً' })}
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
                {t({ en: 'Upcoming Events', ar: 'الفعاليات القادمة' })}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">
                {t({ en: 'View All', ar: 'عرض الكل' })}
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
                {t({ en: 'No upcoming events', ar: 'لا توجد فعاليات قادمة' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ProtectedPage(ViewerDashboard, { requiredPermissions: [] });
