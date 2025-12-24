import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { useRDCallMutations } from '@/hooks/useRDCallMutations';
import { useAuth } from '@/lib/AuthContext';
import { CheckCircle2, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RDCallReviewWorkflow({ rdCall, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const [checklist, setChecklist] = useState({
    objectives_clear: false,
    budget_justified: false,
    timeline_realistic: false,
    evaluation_criteria_defined: false,
    eligibility_appropriate: false,
    themes_aligned: false,
    documentation_complete: false,
    compliance_checked: false
  });

  const [reviewNotes, setReviewNotes] = useState('');
  const { updateRDCall, isUpdating } = useRDCallMutations();

  const handleSubmit = async (approvalDecision) => {
    const newStatus = approvalDecision === 'approve' ? 'published' : 'draft';
    try {
      await updateRDCall({
        id: rdCall.id,
        status: newStatus,
        review_notes: reviewNotes,
        review_checklist: checklist,
        review_decision: approvalDecision,
        review_date: new Date().toISOString()
      }, {
        activityLog: {
          type: 'reviewed',
          description: `R&D Call reviewed with status "${newStatus}" by ${user?.email}`
        }
      });
      onClose();
    } catch (error) {
      // Toast handled by hook
    }
  };

  const allCriticalChecked = checklist.objectives_clear && checklist.budget_justified && checklist.evaluation_criteria_defined;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>{t({ en: 'Review R&D Call', ar: 'مراجعة دعوة البحث' })}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{rdCall.title_en}</p>
          <p className="text-xs text-slate-600 mt-1">{rdCall.code}</p>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t({ en: 'Review Checklist', ar: 'قائمة المراجعة' })}</Label>

          <div className="space-y-2">
            {[
              { key: 'objectives_clear', label: t({ en: 'Objectives are clear and measurable', ar: 'الأهداف واضحة وقابلة للقياس' }), critical: true },
              { key: 'budget_justified', label: t({ en: 'Budget is justified and reasonable', ar: 'الميزانية مبررة ومعقولة' }), critical: true },
              { key: 'timeline_realistic', label: t({ en: 'Timeline is realistic', ar: 'الجدول الزمني واقعي' }), critical: false },
              { key: 'evaluation_criteria_defined', label: t({ en: 'Evaluation criteria well-defined', ar: 'معايير التقييم محددة جيداً' }), critical: true },
              { key: 'eligibility_appropriate', label: t({ en: 'Eligibility criteria appropriate', ar: 'معايير الأهلية مناسبة' }), critical: false },
              { key: 'themes_aligned', label: t({ en: 'Research themes aligned with goals', ar: 'المواضيع البحثية متوافقة' }), critical: false },
              { key: 'documentation_complete', label: t({ en: 'Documentation complete', ar: 'الوثائق مكتملة' }), critical: false },
              { key: 'compliance_checked', label: t({ en: 'Compliance requirements checked', ar: 'متطلبات الامتثال محققة' }), critical: false }
            ].map((item) => (
              <div key={item.key} className={`flex items-center space-x-2 p-3 border rounded-lg ${item.critical ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                <Checkbox
                  checked={checklist[item.key]}
                  onCheckedChange={(checked) => setChecklist({ ...checklist, [item.key]: checked })}
                />
                <label className="text-sm flex-1 cursor-pointer">
                  {item.label}
                  {item.critical && <Badge className="ml-2 bg-red-600 text-white text-xs">Critical</Badge>}
                </label>
              </div>
            ))}
          </div>
        </div>

        {!allCriticalChecked && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900">
              {t({ en: 'All critical items must be checked before approval', ar: 'يجب فحص جميع البنود الحرجة قبل الموافقة' })}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>{t({ en: 'Review Notes', ar: 'ملاحظات المراجعة' })}</Label>
          <Textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={t({ en: 'Add any comments or recommendations...', ar: 'أضف أي تعليقات أو توصيات...' })}
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => handleSubmit('revisions')}
            variant="outline"
            disabled={isUpdating}
            className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {t({ en: 'Request Changes', ar: 'طلب تعديلات' })}
          </Button>
          <Button
            onClick={() => handleSubmit('approve')}
            disabled={!allCriticalChecked || isUpdating}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}