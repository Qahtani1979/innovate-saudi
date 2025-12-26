import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useRDCallMutations } from '@/hooks/useRDCallMutations';
import { toast } from 'sonner';
import { CheckCircle2, X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function RDCallPublishWorkflow({ rdCall, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { publishRDCall, isPublishing } = useRDCallMutations();
  const { triggerEmail } = useEmailTrigger();
  const [notes, setNotes] = useState('');

  const [checklist, setChecklist] = useState({
    title_complete: false,
    objectives_clear: false,
    eligibility_defined: false,
    budget_approved: false,
    timeline_realistic: false,
    evaluation_criteria: false,
    terms_conditions: false,
    contact_info: false
  });

  const handlePublish = async () => {
    try {
      await publishRDCall({
        id: rdCall.id,
        notes
      });

      // Trigger email notification for R&D call published
      triggerEmail('rd.call_published', {
        entity_type: 'rd_call',
        entity_id: rdCall.id,
        variables: {
          call_title: rdCall.title_en || rdCall.title_ar,
          call_type: rdCall.call_type || 'general'
        }
      }).catch(err => console.error('Email trigger failed:', err));

      onClose();
    } catch (error) {
      // Toast handled by hook
    }
  };

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(v => v);
  const readinessScore = Math.round((Object.values(checklist).filter(v => v).length / Object.keys(checklist).length) * 100);

  return (
    <Card className="border-2 border-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            {t({ en: 'Publish R&D Call', ar: 'نشر دعوة البحث' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Readiness Score */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-4xl font-bold text-blue-600 mb-2">{readinessScore}%</div>
          <p className="text-sm text-slate-600">{t({ en: 'Publication Readiness', ar: 'جاهزية النشر' })}</p>
        </div>

        {/* Publication Checklist */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">{t({ en: 'Publication Checklist', ar: 'قائمة التحقق من النشر' })}</h4>

          {[
            { key: 'title_complete', label: { en: 'Title in both languages', ar: 'العنوان باللغتين' }, critical: true },
            { key: 'objectives_clear', label: { en: 'Clear research objectives', ar: 'أهداف بحثية واضحة' }, critical: true },
            { key: 'eligibility_defined', label: { en: 'Eligibility criteria defined', ar: 'معايير الأهلية محددة' }, critical: true },
            { key: 'budget_approved', label: { en: 'Budget approved', ar: 'الميزانية معتمدة' }, critical: true },
            { key: 'timeline_realistic', label: { en: 'Realistic timeline set', ar: 'جدول زمني واقعي' }, critical: false },
            { key: 'evaluation_criteria', label: { en: 'Evaluation criteria clear', ar: 'معايير التقييم واضحة' }, critical: true },
            { key: 'terms_conditions', label: { en: 'Terms & conditions complete', ar: 'الشروط والأحكام كاملة' }, critical: false },
            { key: 'contact_info', label: { en: 'Contact information provided', ar: 'معلومات الاتصال متوفرة' }, critical: false }
          ].map(item => (
            <div
              key={item.key}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${checklist[item.key] ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'
                }`}
              onClick={() => toggleCheck(item.key)}
            >
              <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${checklist[item.key] ? 'bg-green-600 border-green-600' : 'border-slate-300'
                }`}>
                {checklist[item.key] && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900">{item.label[language]}</span>
                  {item.critical && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                      {t({ en: 'Critical', ar: 'حرج' })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning if not ready */}
        {!allChecked && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 text-sm">
                {t({ en: 'Incomplete Checklist', ar: 'قائمة التحقق غير مكتملة' })}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {t({
                  en: 'All critical items must be checked before publication. Non-critical items are recommended.',
                  ar: 'يجب فحص جميع العناصر الحرجة قبل النشر. يُوصى بالعناصر غير الحرجة.'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Publication Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t({ en: 'Publication Notes (Optional)', ar: 'ملاحظات النشر (اختياري)' })}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t({
              en: 'Add any notes about this publication...',
              ar: 'أضف أي ملاحظات حول هذا النشر...'
            })}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!allChecked || isPublishing}
            className="bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Publishing...', ar: 'جاري النشر...' })}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t({ en: 'Publish Call', ar: 'نشر الدعوة' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
