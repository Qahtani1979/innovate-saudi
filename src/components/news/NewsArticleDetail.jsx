import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Calendar, Eye, User, ExternalLink, Star, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useNewsArticle, useNewsArticleMutations } from '@/hooks/useNewsArticles';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  announcement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  innovation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  event: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  achievement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  update: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  municipality: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
};

export default function NewsArticleDetail({ articleId, onBack }) {
  const { language, t } = useLanguage();
  const { data: article, isLoading } = useNewsArticle(articleId);
  const { incrementViewCount } = useNewsArticleMutations();

  useEffect(() => {
    if (articleId) {
      incrementViewCount.mutate(articleId);
    }
  }, [articleId]);

  const handleShare = async () => {
    const url = `${window.location.origin}/news?article=${articleId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t({ en: 'Link copied to clipboard', ar: 'تم نسخ الرابط' }));
    } catch {
      toast.error(t({ en: 'Failed to copy link', ar: 'فشل نسخ الرابط' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t({ en: 'Article not found', ar: 'المقال غير موجود' })}</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back', ar: 'رجوع' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const title = language === 'ar' ? (article.title_ar || article.title_en) : article.title_en;
  const content = language === 'ar' ? (article.content_ar || article.content_en) : (article.content_en || article.content_ar);
  const summary = language === 'ar' ? (article.summary_ar || article.summary_en) : (article.summary_en || article.summary_ar);
  
  const publishDate = article.publish_date ? format(
    new Date(article.publish_date),
    'PPPP',
    { locale: language === 'ar' ? ar : enUS }
  ) : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t({ en: 'Back to News', ar: 'العودة للأخبار' })}
      </Button>

      {/* Article Header */}
      <Card className="overflow-hidden">
        {article.image_url && (
          <div className="relative h-64 md:h-96">
            <img 
              src={article.image_url} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-3">
                {article.is_featured && (
                  <Badge className="bg-amber-500">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    {t({ en: 'Featured', ar: 'مميز' })}
                  </Badge>
                )}
                <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcement}>
                  {article.category}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                {title}
              </h1>
            </div>
          </div>
        )}

        <CardHeader>
          {!article.image_url && (
            <>
              <div className="flex items-center gap-2 mb-3">
                {article.is_featured && (
                  <Badge className="bg-amber-500">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    {t({ en: 'Featured', ar: 'مميز' })}
                  </Badge>
                )}
                <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcement}>
                  {article.category}
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
            </>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
            )}
            {publishDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {publishDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.view_count || 0} {t({ en: 'views', ar: 'مشاهدة' })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1">
              <Share2 className="h-4 w-4" />
              {t({ en: 'Share', ar: 'مشاركة' })}
            </Button>
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {article.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          {summary && (
            <p className="text-lg text-muted-foreground font-medium mb-6 pb-6 border-b">
              {summary}
            </p>
          )}
          
          <ReactMarkdown>
            {content || ''}
          </ReactMarkdown>

          {article.source_url && (
            <div className="mt-8 pt-6 border-t">
              <Button variant="outline" asChild>
                <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t({ en: 'View Original Source', ar: 'عرض المصدر الأصلي' })}
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
