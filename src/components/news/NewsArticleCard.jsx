import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Calendar, Eye, User, ExternalLink, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const CATEGORY_COLORS = {
  announcement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  innovation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  event: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  achievement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  update: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  municipality: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
};

export default function NewsArticleCard({ article, onClick, compact = false }) {
  const { language, t } = useLanguage();
  
  const title = language === 'ar' ? (article.title_ar || article.title_en) : article.title_en;
  const summary = language === 'ar' ? (article.summary_ar || article.summary_en) : (article.summary_en || article.summary_ar);
  
  const publishDate = article.publish_date ? format(
    new Date(article.publish_date),
    'PPP',
    { locale: language === 'ar' ? ar : enUS }
  ) : null;

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="p-4 bg-card rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-3">
          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {article.is_featured && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
              <Badge className={`text-xs ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcement}`}>
                {article.category}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {publishDate && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {publishDate}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={onClick}
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border/50 hover:border-primary/30"
    >
      {article.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.image_url} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {article.is_featured && (
            <Badge className="absolute top-3 right-3 bg-amber-500">
              <Star className="h-3 w-3 mr-1 fill-white" />
              {t({ en: 'Featured', ar: 'مميز' })}
            </Badge>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={CATEGORY_COLORS[article.category] || CATEGORY_COLORS.announcement}>
            {article.category}
          </Badge>
          {article.tags?.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {summary}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author}
              </span>
            )}
            {publishDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {publishDate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{article.view_count || 0}</span>
          </div>
        </div>
        {article.source_url && (
          <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
            <a href={article.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <ExternalLink className="h-3 w-3 mr-1" />
              {t({ en: 'Source', ar: 'المصدر' })}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
