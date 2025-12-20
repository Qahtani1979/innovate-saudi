import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyTemplates } from '@/hooks/strategy/useStrategyTemplates';
import { cn } from '@/lib/utils';

export default function TemplateRatingDialog({ template, trigger, onRated }) {
  const { t } = useLanguage();
  const { rateTemplate } = useStrategyTemplates();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    const result = await rateTemplate(template.id, rating);
    setIsSubmitting(false);
    
    if (result?.success) {
      setOpen(false);
      setRating(0);
      onRated?.(result);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t({ en: 'Rate Template', ar: 'تقييم القالب' })}</DialogTitle>
          <DialogDescription>
            {t({ en: `How would you rate "${template?.name_en}"?`, ar: `كيف تقيم "${template?.name_ar || template?.name_en}"؟` })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {rating === 0 && t({ en: 'Click to rate', ar: 'انقر للتقييم' })}
            {rating === 1 && t({ en: 'Poor', ar: 'ضعيف' })}
            {rating === 2 && t({ en: 'Fair', ar: 'مقبول' })}
            {rating === 3 && t({ en: 'Good', ar: 'جيد' })}
            {rating === 4 && t({ en: 'Very Good', ar: 'جيد جداً' })}
            {rating === 5 && t({ en: 'Excellent', ar: 'ممتاز' })}
          </p>
          
          {template?.template_rating && (
            <p className="text-xs text-muted-foreground mt-4">
              {t({ en: 'Current rating:', ar: 'التقييم الحالي:' })} {template.template_rating} ({template.template_reviews} {t({ en: 'reviews', ar: 'تقييمات' })})
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Submit Rating', ar: 'إرسال التقييم' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
