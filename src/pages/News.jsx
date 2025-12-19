import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Megaphone, Calendar, Award, Rocket, FileText, TrendingUp, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function News() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [], isLoading: pilotsLoading } = useQuery({
    queryKey: ['pilots-news'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').limit(20);
      return data || [];
    }
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs-news'],
    queryFn: async () => {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_published', true)
        .limit(20);
      return data || [];
    }
  });

  const isLoading = pilotsLoading || programsLoading;

  const newsItems = [
    ...pilots.filter(p => p.stage === 'scaled' || p.stage === 'completed').slice(0, 3).map(p => ({
      type: 'pilot_success',
      icon: Award,
      title: { 
        en: `Pilot Success: ${p.title_en}`, 
        ar: `نجاح تجربة: ${p.title_ar || p.title_en}` 
      },
      desc: { 
        en: `Successfully completed pilot phase`, 
        ar: `اكتملت مرحلة التجريب بنجاح` 
      },
      date: p.scaled_date || p.updated_at || p.created_at,
      color: 'green'
    })),
    ...programs.filter(p => p.status === 'active').slice(0, 2).map(p => ({
      type: 'program',
      icon: Rocket,
      title: { 
        en: `Program Launch: ${p.name_en}`, 
        ar: `إطلاق برنامج: ${p.name_ar || p.name_en}` 
      },
      desc: { 
        en: `Now accepting applications`, 
        ar: 'يقبل الطلبات الآن' 
      },
      date: p.created_at,
      color: 'blue'
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const announcements = [
    {
      title: { en: 'New MII Rankings Released', ar: 'تصنيفات MII الجديدة' },
      date: '2025-01-15',
      type: 'announcement'
    },
    {
      title: { en: 'Q2 Innovation Forum Registration Open', ar: 'التسجيل مفتوح لمنتدى الابتكار Q2' },
      date: '2025-01-10',
      type: 'event'
    },
    {
      title: { en: 'Platform 2.0 Features Launched', ar: 'إطلاق ميزات المنصة 2.0' },
      date: '2025-01-05',
      type: 'platform'
    }
  ];

  const colorClasses = {
    green: 'from-green-500/10 via-green-500/5 to-transparent border-green-200/50 dark:border-green-800/50',
    blue: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 dark:border-blue-800/50',
    purple: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 dark:border-purple-800/50',
    amber: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/50 dark:border-amber-800/50'
  };

  const iconColorClasses = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Megaphone}
        title={t({ en: 'News & Updates', ar: 'الأخبار والتحديثات' })}
        description={t({ en: 'Latest innovations, milestones, and announcements', ar: 'آخر الابتكارات والإنجازات والإعلانات' })}
        stats={[
          { value: newsItems.length, label: t({ en: 'Updates', ar: 'تحديثات' }), icon: TrendingUp },
          { value: announcements.length, label: t({ en: 'Announcements', ar: 'إعلانات' }), icon: Megaphone },
        ]}
      />

      {/* Featured Announcements */}
      <Card className="border-2 border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Megaphone className="h-5 w-5 text-amber-500" />
            {t({ en: 'Platform Announcements', ar: 'إعلانات المنصة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements.map((ann, i) => (
              <div key={i} className="p-4 bg-card rounded-lg border border-border/50 hover:border-amber-300/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {ann.title[language]}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ann.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{ann.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest News */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t({ en: 'Latest Updates', ar: 'آخر التحديثات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {newsItems.length === 0 ? (
            <CitizenEmptyState
              icon={Megaphone}
              title={t({ en: 'No news yet', ar: 'لا توجد أخبار بعد' })}
              description={t({ en: 'Check back later for updates', ar: 'تحقق لاحقاً للتحديثات' })}
            />
          ) : (
            <div className="space-y-4">
              {newsItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`p-6 rounded-xl border bg-gradient-to-br ${colorClasses[item.color]}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${iconColorClasses[item.color]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-2">
                          {item.title[language]}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {item.desc[language]}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{item.date ? new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscribe CTA */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6 text-center">
          <Megaphone className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t({ en: 'Stay Updated', ar: 'ابق على اطلاع' })}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t({ en: 'Get the latest news and updates delivered to your inbox', ar: 'احصل على آخر الأخبار والتحديثات في بريدك الإلكتروني' })}
          </p>
        </CardContent>
      </Card>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(News, { requiredPermissions: [] });
