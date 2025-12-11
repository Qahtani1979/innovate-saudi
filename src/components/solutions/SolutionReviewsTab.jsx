import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Star, ThumbsUp, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';

export default function SolutionReviewsTab({ solution }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['solution-reviews', solution.id],
    queryFn: async () => {
      const { data } = await supabase.from('solution_reviews').select('*')
        .eq('solution_id', solution.id)
        .eq('is_public', true)
        .order('created_date', { ascending: false })
        .limit(100);
      return data || [];
    }
  });

  const { data: userPilots = [] } = useQuery({
    queryKey: ['user-solution-pilots', solution.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('pilots').select('*')
        .eq('solution_id', solution.id)
        .eq('created_by', user.email)
        .in('stage', ['completed', 'scaled']);
      return data || [];
    },
    enabled: !!user
  });

  const [reviewData, setReviewData] = useState({
    pilot_id: '',
    overall_rating: 5,
    ratings: {
      technical_quality: 5,
      ease_of_integration: 5,
      support_quality: 5,
      value_for_money: 5,
      documentation_quality: 5,
      performance: 5,
      reliability: 5,
      scalability: 5
    },
    review_title: '',
    review_text: '',
    pros: [],
    cons: [],
    would_recommend: true
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data) => {
      const review = await base44.entities.SolutionReview.create(data);
      
      // Update solution aggregate ratings
      const allReviews = [...reviews, review];
      const avgRating = allReviews.reduce((sum, r) => sum + r.overall_rating, 0) / allReviews.length;
      await base44.entities.Solution.update(solution.id, {
        average_rating: avgRating,
        total_reviews: allReviews.length,
        ratings: {
          average: avgRating,
          count: allReviews.length,
          breakdown: {
            5: allReviews.filter(r => r.overall_rating === 5).length,
            4: allReviews.filter(r => r.overall_rating === 4).length,
            3: allReviews.filter(r => r.overall_rating === 3).length,
            2: allReviews.filter(r => r.overall_rating === 2).length,
            1: allReviews.filter(r => r.overall_rating === 1).length
          }
        }
      });

      // Log activity
      await base44.entities.SystemActivity.create({
        entity_type: 'Solution',
        entity_id: solution.id,
        activity_type: 'review_submitted',
        description: `Review submitted: ${data.overall_rating}/5 stars by ${data.reviewer_name}`,
        metadata: { rating: data.overall_rating, pilot_id: data.pilot_id }
      });

      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-reviews']);
      queryClient.invalidateQueries(['solution', solution.id]);
      toast.success(t({ en: 'Review submitted successfully!', ar: 'تم تقديم المراجعة بنجاح!' }));
      setShowReviewForm(false);
    }
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
    );
  };

  const avgRating = solution.average_rating || 0;
  const totalReviews = solution.total_reviews || reviews.length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Rating Summary */}
      <Card className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-6xl font-bold text-yellow-600">{avgRating.toFixed(1)}</span>
                <Star className="h-12 w-12 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(avgRating))}
              </div>
              <p className="text-sm text-slate-600">
                {totalReviews} {t({ en: 'reviews', ar: 'مراجعة' })}
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = solution.ratings?.breakdown?.[stars] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-12">{stars} {t({ en: 'stars', ar: 'نجوم' })}</span>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm text-slate-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {userPilots.length > 0 && !showReviewForm && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={() => setShowReviewForm(true)} className="w-full bg-yellow-600">
                <Star className="h-4 w-4 mr-2" />
                {t({ en: 'Write a Review', ar: 'كتابة مراجعة' })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{t({ en: 'Submit Your Review', ar: 'تقديم مراجعتك' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Select Pilot', ar: 'اختر التجربة' })}</Label>
              <Select
                value={reviewData.pilot_id}
                onValueChange={(v) => setReviewData({ ...reviewData, pilot_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select pilot...', ar: 'اختر تجربة...' })} />
                </SelectTrigger>
                <SelectContent>
                  {userPilots.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Overall Rating', ar: 'التقييم الإجمالي' })}</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(stars => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, overall_rating: stars })}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        stars <= reviewData.overall_rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-slate-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t({ en: 'Detailed Ratings', ar: 'التقييمات التفصيلية' })}</Label>
              {Object.keys(reviewData.ratings).map(category => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 capitalize">
                    {category.replace(/_/g, ' ')}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(stars => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewData({
                          ...reviewData,
                          ratings: { ...reviewData.ratings, [category]: stars }
                        })}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            stars <= reviewData.ratings[category]
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Review Title', ar: 'عنوان المراجعة' })}</Label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={reviewData.review_title}
                onChange={(e) => setReviewData({ ...reviewData, review_title: e.target.value })}
                placeholder={t({ en: 'Summarize your experience...', ar: 'لخص تجربتك...' })}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Review Details', ar: 'تفاصيل المراجعة' })}</Label>
              <Textarea
                value={reviewData.review_text}
                onChange={(e) => setReviewData({ ...reviewData, review_text: e.target.value })}
                rows={4}
                placeholder={t({ en: 'Share your detailed experience...', ar: 'شارك تجربتك التفصيلية...' })}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reviewData.would_recommend}
                onChange={(e) => setReviewData({ ...reviewData, would_recommend: e.target.checked })}
                className="h-4 w-4"
              />
              <Label>{t({ en: 'I would recommend this solution to other municipalities', ar: 'أوصي بهذا الحل للبلديات الأخرى' })}</Label>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
                className="flex-1"
              >
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!reviewData.pilot_id) {
                    toast.error(t({ en: 'Please select a pilot', ar: 'يرجى اختيار تجربة' }));
                    return;
                  }
                  createReviewMutation.mutate({
                    solution_id: solution.id,
                    municipality_id: user.municipality_id,
                    reviewer_email: user.email,
                    reviewer_name: user.full_name,
                    reviewer_role: user.role,
                    ...reviewData
                  });
                }}
                disabled={createReviewMutation.isPending}
                className="flex-1 bg-yellow-600"
              >
                {t({ en: 'Submit Review', ar: 'تقديم المراجعة' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">
          {t({ en: 'User Reviews', ar: 'مراجعات المستخدمين' })} ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {t({ en: 'No reviews yet', ar: 'لا توجد مراجعات بعد' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review, idx) => (
            <Card key={idx} className="border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.overall_rating)}
                      <span className="text-lg font-bold text-slate-900">{review.overall_rating}/5</span>
                    </div>
                    {review.review_title && (
                      <h4 className="font-semibold text-slate-900">{review.review_title}</h4>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{review.reviewer_name}</span>
                      <span>•</span>
                      <span>{format(new Date(review.created_date), 'MMM d, yyyy')}</span>
                      {review.reviewer_role && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{review.reviewer_role}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  {review.would_recommend && (
                    <Badge className="bg-green-100 text-green-700">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {t({ en: 'Recommended', ar: 'موصى به' })}
                    </Badge>
                  )}
                </div>

                {review.review_text && (
                  <p className="text-sm text-slate-700 mb-3">{review.review_text}</p>
                )}

                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    {review.pros?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-green-900">
                          {t({ en: 'Pros:', ar: 'الإيجابيات:' })}
                        </p>
                        <ul className="space-y-1">
                          {review.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-green-600">✓</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-amber-900">
                          {t({ en: 'Cons:', ar: 'السلبيات:' })}
                        </p>
                        <ul className="space-y-1">
                          {review.cons.map((con, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-amber-600">−</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {review.provider_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      {t({ en: 'Provider Response:', ar: 'رد المزود:' })}
                    </p>
                    <p className="text-sm text-slate-700">{review.provider_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}