import { useState } from 'react';
import { usePublishedNews, useFeaturedNews } from '@/hooks/useNewsArticles';
import { useNewsData } from '@/hooks/useNewsData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Megaphone, Calendar, Award, Rocket, TrendingUp, Loader2, Search, Star } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useSearchParams } from 'react-router-dom';
import {
  CitizenPageLayout,
  CitizenPageHeader,
  CitizenEmptyState
} from '@/components/citizen/CitizenPageLayout';
import { usePublishedNews, useFeaturedNews } from '@/hooks/useNewsArticles';
import NewsArticleCard from '@/components/news/NewsArticleCard';
import NewsArticleDetail from '@/components/news/NewsArticleDetail';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

function News() {
  const { language, isRTL, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedArticleId = searchParams.get('article');

  // Fetch published news articles from database
  const { data: newsArticles = [], isLoading: newsLoading } = usePublishedNews(50);
  const { data: featuredArticles = [] } = useFeaturedNews(3);

  // Fetch dynamic updates
  const { pilots, programs, isLoading: dynamicLoading } = useNewsData();

  const isLoading = newsLoading || dynamicLoading;

  // Filter articles by search
  const filteredArticles = newsArticles.filter(article => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title_en?.toLowerCase().includes(query) ||
      article.title_ar?.includes(searchQuery) ||
      article.category?.toLowerCase().includes(query) ||
      article.author?.toLowerCase().includes(query)
    );
  });

  // Create dynamic news items from pilots and programs
  const dynamicNewsItems = [
    ...pilots.slice(0, 3).map(p => ({
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
    ...programs.slice(0, 2).map(p => ({
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

  // Show article detail if selected
  if (selectedArticleId) {
    return (
      <CitizenPageLayout>
        <NewsArticleDetail
          articleId={selectedArticleId}
          onBack={() => setSearchParams({})}
        />
      </CitizenPageLayout>
    );
  }

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
          { value: newsArticles.length, label: t({ en: 'Articles', ar: 'مقالات' }), icon: Megaphone },
          { value: featuredArticles.length, label: t({ en: 'Featured', ar: 'مميز' }), icon: Star },
          { value: dynamicNewsItems.length, label: t({ en: 'Updates', ar: 'تحديثات' }), icon: TrendingUp },
        ]}
      />

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t({ en: 'Search news...', ar: 'بحث في الأخبار...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && !searchQuery && (
        <Card className="border-2 border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-500/5 to-transparent mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              {t({ en: 'Featured Stories', ar: 'قصص مميزة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredArticles.map(article => (
                <NewsArticleCard
                  key={article.id}
                  article={article}
                  compact
                  onClick={() => setSearchParams({ article: article.id })}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Articles from Database */}
      {filteredArticles.length > 0 && (
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {t({ en: 'Latest News', ar: 'آخر الأخبار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <NewsArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setSearchParams({ article: article.id })}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Updates from Pilots/Programs */}
      {dynamicNewsItems.length > 0 && !searchQuery && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t({ en: 'Platform Updates', ar: 'تحديثات المنصة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dynamicNewsItems.map((item, i) => {
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
                            <span>{item.date ? format(new Date(item.date), 'PPP', { locale: language === 'ar' ? ar : enUS }) : '-'}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && dynamicNewsItems.length === 0 && (
        <CitizenEmptyState
          icon={Megaphone}
          title={t({ en: 'No news yet', ar: 'لا توجد أخبار بعد' })}
          description={t({ en: 'Check back later for updates', ar: 'تحقق لاحقاً للتحديثات' })}
        />
      )}

      {/* Subscribe CTA */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 mt-6">
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
