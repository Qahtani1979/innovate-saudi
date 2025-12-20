import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Quote, Star, Building2, ThumbsUp } from 'lucide-react';

export default function ClientTestimonialsShowcase({ solutionId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: reviews = [] } = useQuery({
    queryKey: ['solution-reviews-testimonials', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_reviews')
        .select('*')
        .eq('solution_id', solutionId)
        .gte('overall_rating', 4)
        .not('review_text', 'is', null)
        .order('overall_rating', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!solutionId
  });

  const featuredReviews = reviews.slice(0, 6);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-purple-600" />
          {t({ en: 'Client Testimonials', ar: 'شهادات العملاء' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {featuredReviews.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 text-center">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2 fill-purple-600" />
                <p className="text-3xl font-bold text-purple-600">{avgRating}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Average Rating', ar: 'متوسط التقييم' })}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 text-center">
                <ThumbsUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">{reviews.length}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Total Reviews', ar: 'إجمالي المراجعات' })}</p>
              </div>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredReviews.map((review) => (
                <div key={review.id} className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-200">
                  <div className="flex items-start gap-3 mb-3">
                    <Quote className="h-6 w-6 text-purple-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 italic line-clamp-3">
                        "{review.review_text}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{review.reviewer_name || 'Municipality Client'}</p>
                        <p className="text-xs text-slate-500">{review.municipality_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-amber-600">{review.overall_rating}</span>
                    </div>
                  </div>

                  {review.would_recommend && (
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        ✓ {t({ en: 'Would Recommend', ar: 'يوصي به' })}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {reviews.length > 6 && (
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  {t({ en: `+${reviews.length - 6} more testimonials`, ar: `+${reviews.length - 6} شهادات أخرى` })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Quote className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No client testimonials yet', ar: 'لا توجد شهادات عملاء بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}