import { useState } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { usePilotMutations } from '@/hooks/usePilotMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from './LanguageContext';
import { LogOut, CheckCircle2, X, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxProjectExitWizard({ pilot, sandbox, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useAppQueryClient();
  const [step, setStep] = useState(1);

  const [exitData, setExitData] = useState({
    exit_type: '', // successful_completion, early_termination, regulatory_violation, voluntary_withdrawal
    completion_percentage: 100,
    outcomes_achieved: '',
    lessons_learned: '',
    safety_incidents: 0,
    compliance_issues: '',
    recommendation: '', // scale, iterate, terminate
    scaling_potential: '',
    exit_checklist: {
      final_report_submitted: false,
      data_handed_over: false,
      equipment_returned: false,
      site_cleaned: false,
      final_safety_audit: false,
      exemptions_revoked: false,
      stakeholders_notified: false
    },
    exit_notes: ''
  });

  const { exitPilotFromSandbox } = usePilotMutations();

  const handleExit = () => {
    exitPilotFromSandbox.mutate({
      pilotId: pilot.id,
      sandboxId: sandbox?.id,
      exitData: exitData,
      currentSandboxStats: {
        current_pilots: sandbox?.current_pilots,
        total_completed_projects: sandbox?.total_completed_projects
      }
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const handleNext = () => {
    if (step === 1 && !exitData.exit_type) {
      toast.error(t({ en: 'Please select exit type', ar: 'يرجى اختيار نوع الخروج' }));
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = () => {
    const requiredChecks = Object.values(exitData.exit_checklist).filter(Boolean).length;
    if (requiredChecks < 5) {
      toast.error(t({ en: 'Please complete at least 5 checklist items', ar: 'يرجى إكمال 5 عناصر على الأقل' }));
      return;
    }
    handleExit();
  };

  const exitTypeConfig = {
    successful_completion: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    early_termination: { color: 'bg-red-100 text-red-700', icon: X },
    regulatory_violation: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    voluntary_withdrawal: { color: 'bg-yellow-100 text-yellow-700', icon: LogOut }
  };

  return (
    <Card className="w-full max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <LogOut className="h-5 w-5 text-blue-600" />
          {t({ en: 'Sandbox Project Exit Wizard', ar: 'معالج الخروج من منطقة التجريب' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Exit Type & Summary */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">{pilot?.title_en}</p>
              <p className="text-xs text-slate-600 mt-1">{sandbox?.name_en}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Exit Type', ar: 'نوع الخروج' })} *
              </label>
              <Select value={exitData.exit_type} onValueChange={(val) => setExitData({ ...exitData, exit_type: val })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select exit type', ar: 'اختر نوع الخروج' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful_completion">
                    {t({ en: '✅ Successful Completion', ar: '✅ إنجاز ناجح' })}
                  </SelectItem>
                  <SelectItem value="early_termination">
                    {t({ en: '⛔ Early Termination', ar: '⛔ إنهاء مبكر' })}
                  </SelectItem>
                  <SelectItem value="regulatory_violation">
                    {t({ en: '⚠️ Regulatory Violation', ar: '⚠️ مخالفة تنظيمية' })}
                  </SelectItem>
                  <SelectItem value="voluntary_withdrawal">
                    {t({ en: '🔄 Voluntary Withdrawal', ar: '🔄 انسحاب طوعي' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Outcomes Achieved', ar: 'النتائج المحققة' })}
              </label>
              <Textarea
                value={exitData.outcomes_achieved}
                onChange={(e) => setExitData({ ...exitData, outcomes_achieved: e.target.value })}
                rows={4}
                placeholder={t({
                  en: 'Describe what was achieved during the sandbox period...',
                  ar: 'صف ما تم إنجازه خلال فترة المنطقة...'
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Recommendation', ar: 'التوصية' })}
              </label>
              <Select value={exitData.recommendation} onValueChange={(val) => setExitData({ ...exitData, recommendation: val })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select recommendation', ar: 'اختر التوصية' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scale">{t({ en: 'Scale to broader deployment', ar: 'توسيع النشر' })}</SelectItem>
                  <SelectItem value="iterate">{t({ en: 'Iterate and refine', ar: 'تحسين وتطوير' })}</SelectItem>
                  <SelectItem value="terminate">{t({ en: 'Terminate project', ar: 'إنهاء المشروع' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Lessons & Compliance */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
              </label>
              <Textarea
                value={exitData.lessons_learned}
                onChange={(e) => setExitData({ ...exitData, lessons_learned: e.target.value })}
                rows={5}
                placeholder={t({
                  en: 'Key learnings from this sandbox experience...',
                  ar: 'التعلمات الرئيسية من هذه التجربة...'
                })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Safety Incidents Count', ar: 'عدد حوادث السلامة' })}
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={exitData.safety_incidents}
                onChange={(e) => setExitData({ ...exitData, safety_incidents: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>

            {exitData.safety_incidents > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Compliance Issues', ar: 'مشاكل الامتثال' })}
                </label>
                <Textarea
                  value={exitData.compliance_issues}
                  onChange={(e) => setExitData({ ...exitData, compliance_issues: e.target.value })}
                  rows={3}
                  placeholder={t({ en: 'Describe any compliance or safety issues...', ar: 'صف أي مشاكل امتثال أو سلامة...' })}
                />
              </div>
            )}

            {exitData.recommendation === 'scale' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Scaling Potential', ar: 'إمكانية التوسع' })}
                </label>
                <Textarea
                  value={exitData.scaling_potential}
                  onChange={(e) => setExitData({ ...exitData, scaling_potential: e.target.value })}
                  rows={3}
                  placeholder={t({ en: 'Describe scaling opportunities...', ar: 'صف فرص التوسع...' })}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Exit Checklist */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">
                {t({ en: 'Exit Requirements Checklist', ar: 'قائمة متطلبات الخروج' })}
              </p>
              <p className="text-xs text-slate-600">
                {t({ en: 'Complete these items before finalizing the exit', ar: 'أكمل هذه العناصر قبل إنهاء الخروج' })}
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries({
                final_report_submitted: t({ en: 'Final project report submitted', ar: 'تقرير المشروع النهائي مقدم' }),
                data_handed_over: t({ en: 'All data and documentation handed over', ar: 'جميع البيانات والوثائق مسلمة' }),
                equipment_returned: t({ en: 'Equipment and resources returned', ar: 'المعدات والموارد مرجعة' }),
                site_cleaned: t({ en: 'Test site cleaned and restored', ar: 'موقع الاختبار نظيف ومستعاد' }),
                final_safety_audit: t({ en: 'Final safety audit completed', ar: 'التدقيق الأمني النهائي مكتمل' }),
                exemptions_revoked: t({ en: 'Regulatory exemptions revoked', ar: 'الإعفاءات التنظيمية ملغاة' }),
                stakeholders_notified: t({ en: 'All stakeholders notified', ar: 'جميع الأطراف المعنية أبلغت' })
              }).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
                  <Checkbox
                    checked={exitData.exit_checklist[key]}
                    onCheckedChange={(checked) =>
                      setExitData({
                        ...exitData,
                        exit_checklist: { ...exitData.exit_checklist, [key]: checked }
                      })
                    }
                  />
                  <p className="text-sm text-slate-900">{label}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Additional Exit Notes', ar: 'ملاحظات خروج إضافية' })}
              </label>
              <Textarea
                value={exitData.exit_notes}
                onChange={(e) => setExitData({ ...exitData, exit_notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              {t({ en: 'Back', ar: 'السابق' })}
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {t({ en: 'Next', ar: 'التالي' })}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={exitPilotFromSandbox.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {exitPilotFromSandbox.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Complete Exit', ar: 'إكمال الخروج' })}
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="text-center text-xs text-slate-500">
          {t({ en: `Step ${step} of 3`, ar: `الخطوة ${step} من 3` })}
        </div>
      </CardContent>
    </Card>
  );
}

