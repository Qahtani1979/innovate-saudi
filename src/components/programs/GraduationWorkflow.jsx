import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Award, FileText, Send, CheckCircle2, X } from 'lucide-react';

export default function GraduationWorkflow({ participant, program, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState({
    attendance_met: true,
    deliverables_met: true,
    performance_satisfactory: true,
    final_presentation: false
  });
  const [feedback, setFeedback] = useState('');

  const allChecksPassed = Object.values(assessment).every(v => v === true);

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          {t({ en: 'Graduation Workflow', ar: 'سير عمل التخرج' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
          ))}
        </div>

        {/* Step 1: Final Assessment */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t({ en: 'Step 1: Final Assessment', ar: 'الخطوة 1: التقييم النهائي' })}</h3>
            <div className="space-y-3">
              {[
                { key: 'attendance_met', label: t({ en: 'Attendance ≥ 80%', ar: 'الحضور ≥ 80٪' }) },
                { key: 'deliverables_met', label: t({ en: 'All deliverables submitted', ar: 'جميع المخرجات مقدمة' }) },
                { key: 'performance_satisfactory', label: t({ en: 'Performance satisfactory', ar: 'الأداء مرضٍ' }) },
                { key: 'final_presentation', label: t({ en: 'Final presentation completed', ar: 'العرض النهائي مكتمل' }) }
              ].map(item => (
                <div key={item.key} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox 
                    checked={assessment[item.key]} 
                    onCheckedChange={(checked) => setAssessment({...assessment, [item.key]: checked})}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Feedback */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t({ en: 'Step 2: Final Feedback', ar: 'الخطوة 2: الملاحظات النهائية' })}</h3>
            <Textarea 
              placeholder={t({ en: 'Program feedback and recommendations...', ar: 'ملاحظات البرنامج والتوصيات...' })}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
            />
          </div>
        )}

        {/* Step 3: Certificate & Follow-up */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">{t({ en: 'Step 3: Certificate & Next Steps', ar: 'الخطوة 3: الشهادة والخطوات التالية' })}</h3>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-900">{t({ en: 'Ready to Graduate', ar: 'جاهز للتخرج' })}</p>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{t({ en: 'Certificate will be generated', ar: 'سيتم إنشاء الشهادة' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>{t({ en: 'Follow-up email scheduled', ar: 'تم جدولة بريد المتابعة' })}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-2">{t({ en: 'Post-Program Engagement', ar: 'المشاركة بعد البرنامج' })}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="alumni" />
                  <label htmlFor="alumni" className="text-sm">{t({ en: 'Add to alumni network', ar: 'إضافة إلى شبكة الخريجين' })}</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="follow-up" />
                  <label htmlFor="follow-up" className="text-sm">{t({ en: 'Schedule 3-month follow-up', ar: 'جدولة متابعة بعد 3 أشهر' })}</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="survey" />
                  <label htmlFor="survey" className="text-sm">{t({ en: 'Send feedback survey', ar: 'إرسال استبيان الملاحظات' })}</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !allChecksPassed}>
              {t({ en: 'Next', ar: 'التالي' })}
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700">
              <Award className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Complete Graduation', ar: 'إكمال التخرج' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}