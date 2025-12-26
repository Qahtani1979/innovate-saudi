import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { Scale, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PolicyLegalReviewGate({ policy }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { submitLegalReview } = usePolicyMutations();
  const [reviewData, setReviewData] = useState({
    status: 'pending',
    comments: '',
    checklist: [
      { item: 'Legal citations accurate and complete', checked: false },
      { item: 'No conflict with existing regulations', checked: false },
      { item: 'Authority and jurisdiction clearly defined', checked: false },
      { item: 'Implementation mechanism legally sound', checked: false },
      { item: 'Enforcement provisions adequate', checked: false }
    ]
  });

  const handleSubmitReview = () => {
    submitLegalReview.mutate({
      id: policy.id,
      reviewData,
      approvals: policy.approvals
    });
  };

  const existingReview = policy.legal_review;
  const hasReview = existingReview && existingReview.status !== 'pending';

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-600" />
          <span>{t({ en: 'Legal Review Gate', ar: 'بوابة المراجعة القانونية' })}</span>
          {hasReview && (
            <Badge className={
              existingReview.status === 'approved' ? 'bg-green-100 text-green-700' :
                existingReview.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
            }>
              {existingReview.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasReview ? (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Reviewed by:', ar: 'راجعه:' })}</p>
              <p className="text-sm font-medium">{existingReview.reviewer_email}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(existingReview.review_date).toLocaleDateString()}
              </p>
            </div>
            {existingReview.comments && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  {t({ en: 'Comments:', ar: 'ملاحظات:' })}
                </p>
                <p className="text-sm text-slate-700">{existingReview.comments}</p>
              </div>
            )}
            {existingReview.checklist && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  {t({ en: 'Checklist:', ar: 'قائمة التحقق:' })}
                </p>
                {existingReview.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {item.checked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-slate-700">{item.item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                {t({ en: 'Legal Review Checklist:', ar: 'قائمة المراجعة القانونية:' })}
              </p>
              {reviewData.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => {
                      const updated = [...reviewData.checklist];
                      updated[i].checked = e.target.checked;
                      setReviewData({ ...reviewData, checklist: updated });
                    }}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{item.item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Review Comments', ar: 'ملاحظات المراجعة' })}</Label>
              <Textarea
                value={reviewData.comments}
                onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                rows={4}
                placeholder={t({
                  en: 'Legal review notes and recommendations...',
                  ar: 'ملاحظات المراجعة القانونية والتوصيات...'
                })}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Decision', ar: 'القرار' })}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={reviewData.status === 'approved' ? 'default' : 'outline'}
                  onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t({ en: 'Approve', ar: 'موافقة' })}
                </Button>
                <Button
                  variant={reviewData.status === 'requires_changes' ? 'default' : 'outline'}
                  onClick={() => setReviewData({ ...reviewData, status: 'requires_changes' })}
                  className="gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t({ en: 'Changes', ar: 'تعديلات' })}
                </Button>
                <Button
                  variant={reviewData.status === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  {t({ en: 'Reject', ar: 'رفض' })}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={submitLegalReview.isPending || reviewData.status === 'pending'}
              className="w-full gap-2 bg-blue-600"
            >
              {submitLegalReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t({ en: 'Submit Legal Review', ar: 'تقديم المراجعة القانونية' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
