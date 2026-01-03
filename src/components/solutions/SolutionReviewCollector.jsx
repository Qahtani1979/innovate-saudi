import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useCreateReview } from '@/hooks/useSolutionReviews';

export default function SolutionReviewCollector({ solution, onClose }) {
  const { t, isRTL } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerOrg, setReviewerOrg] = useState('');

  const createReview = useCreateReview();

  const handleSubmit = async () => {
    try {
      await createReview.mutateAsync({
        solutionId: solution.id,
        overall_rating: rating,
        review_text: reviewText,
        reviewerName: reviewerName,
        reviewerRole: reviewerOrg,
        municipalityId: null,
        is_public: true
      });

      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-600" />
          {t({ en: 'Submit Review', ar: 'إرسال مراجعة' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-900">{solution?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">{solution?.provider_name}</p>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 mb-3">
            {t({ en: 'Your Rating', ar: 'تقييمك' })}
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-slate-600 mt-2">
              {rating === 5 && t({ en: 'Excellent!', ar: 'ممتاز!' })}
              {rating === 4 && t({ en: 'Very Good', ar: 'جيد جداً' })}
              {rating === 3 && t({ en: 'Good', ar: 'جيد' })}
              {rating === 2 && t({ en: 'Fair', ar: 'مقبول' })}
              {rating === 1 && t({ en: 'Poor', ar: 'ضعيف' })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Your Name', ar: 'اسمك' })}
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder={t({ en: 'Name', ar: 'الاسم' })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Organization', ar: 'المنظمة' })}
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={reviewerOrg}
              onChange={(e) => setReviewerOrg(e.target.value)}
              placeholder={t({ en: 'Organization', ar: 'المنظمة' })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Your Review', ar: 'مراجعتك' })}
          </label>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder={t({
              en: 'Share your experience with this solution...',
              ar: 'شارك تجربتك مع هذا الحل...'
            })}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || !reviewText || !reviewerName || createReview.isPending}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {createReview.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Submit Review', ar: 'إرسال المراجعة' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
