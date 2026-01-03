import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Target, CheckCircle2, X, Loader2, AlertCircle } from 'lucide-react';

import { Progress } from "@/components/ui/progress";
import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function ProgramMidReviewGate({ program, onClose }) {
  const { t, isRTL } = useLanguage();

  const reviewChecks = [
    { id: 'attendance_good', label: { en: 'Participant attendance satisfactory', ar: 'حضور المشاركين مرضٍ' } },
    { id: 'engagement_high', label: { en: 'Engagement levels high', ar: 'مستويات المشاركة عالية' } },
    { id: 'content_relevant', label: { en: 'Content remains relevant', ar: 'المحتوى لا يزال ملائماً' } },
    { id: 'mentor_feedback_positive', label: { en: 'Mentor feedback positive', ar: 'تغذية الموجهين إيجابية' } },
    { id: 'on_schedule', label: { en: 'Program on schedule', ar: 'البرنامج ضمن الجدول' } },
    { id: 'budget_on_track', label: { en: 'Budget utilization on track', ar: 'استخدام الميزانية ضمن المسار' } }
  ];

  const [checklist, setChecklist] = useState(
    reviewChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {})
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [adjustments, setAdjustments] = useState('');

  const { completeMidReview, isReviewing } = useProgramMutations();

  const handleCompleteReview = async () => {
    try {
      await completeMidReview.mutateAsync({
        programId: program.id,
        checklist,
        notes: reviewNotes,
        adjustments
      });
      onClose();
    } catch (error) {
      // toast is handled by hook
    }
  };

  const passedChecks = Object.values(checklist).filter(Boolean).length;
  const progress = (passedChecks / reviewChecks.length) * 100;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {t({ en: 'Mid-Program Review', ar: 'المراجعة النصفية' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{program?.name_en}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-600">Review Progress</p>
            <Badge className="bg-blue-600 text-white">{passedChecks}/{reviewChecks.length}</Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Review Checklist', ar: 'قائمة المراجعة' })}
          </p>
          {reviewChecks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={checklist[check.id]}
                onCheckedChange={(checked) => setChecklist({ ...checklist, [check.id]: checked })}
                className="mt-0.5"
              />
              <p className="text-sm text-slate-900">{check.label[isRTL ? 'ar' : 'en']}</p>
            </div>
          ))}
        </div>

        {passedChecks < reviewChecks.length * 0.7 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {t({
                en: 'Less than 70% of checks passed. Consider program adjustments.',
                ar: 'أقل من 70% من الفحوصات نجحت. يُنصح بتعديلات للبرنامج.'
              })}
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Review Notes', ar: 'ملاحظات المراجعة' })}
          </label>
          <Textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            placeholder={t({ en: 'General observations...', ar: 'ملاحظات عامة...' })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Planned Adjustments', ar: 'التعديلات المخططة' })}
          </label>
          <Textarea
            value={adjustments}
            onChange={(e) => setAdjustments(e.target.value)}
            rows={3}
            placeholder={t({ en: 'What will be adjusted for remaining sessions...', ar: 'ما سيتم تعديله للجلسات المتبقية...' })}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleCompleteReview}
            disabled={isReviewing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isReviewing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Complete Review', ar: 'إكمال المراجعة' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
