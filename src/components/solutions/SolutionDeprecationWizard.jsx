import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Calendar, Mail, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDeprecateSolution } from '@/hooks/useSolutionWorkflows';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SolutionDeprecationWizard({ solution, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [deprecationData, setDeprecationData] = useState({
    deprecation_reason: '',
    end_of_life_date: '',
    replacement_solution_id: '',
    notification_message_en: '',
    notification_message_ar: '',
    migration_support_offered: true,
    support_end_date: ''
  });

  const steps = [
    { title: { en: 'Reason', ar: 'السبب' }, icon: AlertTriangle },
    { title: { en: 'Timeline', ar: 'الجدول الزمني' }, icon: Calendar },
    { title: { en: 'Notifications', ar: 'الإشعارات' }, icon: Mail },
    { title: { en: 'Confirm', ar: 'تأكيد' }, icon: CheckCircle2 }
  ];

  const deprecateMutation = useDeprecateSolution();

  const handleDeprecate = () => {
    deprecateMutation.mutate({ solution, deprecationData }, {
      onSuccess: (result) => {
        setOpen(false);
        onComplete?.();
      }
    });
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!deprecationData.deprecation_reason || !deprecationData.end_of_life_date) {
      toast.error(t({ en: 'Please fill required fields', ar: 'يرجى ملء الحقول المطلوبة' }));
      return;
    }
    handleDeprecate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
          <XCircle className="h-4 w-4 mr-2" />
          {t({ en: 'Deprecate Solution', ar: 'إيقاف الحل' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t({ en: 'Solution Deprecation Workflow', ar: 'سير عمل إيقاف الحل' })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div>
            <Progress value={(step / (steps.length - 1)) * 100} className="mb-3" />
            <div className="flex justify-between text-xs">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`flex items-center gap-1 ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
                    <Icon className="h-3 w-3" />
                    <span>{s.title[language]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {step === 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900">
                    {t({
                      en: 'Warning: Deprecating this solution will notify all municipalities using it in active pilots.',
                      ar: 'تحذير: إيقاف هذا الحل سيشعر جميع البلديات التي تستخدمه في التجارب النشطة.'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Deprecation Reason *', ar: 'سبب الإيقاف *' })}</Label>
                  <Textarea
                    value={deprecationData.deprecation_reason}
                    onChange={(e) => setDeprecationData({ ...deprecationData, deprecation_reason: e.target.value })}
                    rows={4}
                    placeholder={t({
                      en: 'Explain why this solution is being deprecated...',
                      ar: 'اشرح سبب إيقاف هذا الحل...'
                    })}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'End of Life Date *', ar: 'تاريخ نهاية الحياة *' })}</Label>
                    <Input
                      type="date"
                      value={deprecationData.end_of_life_date}
                      onChange={(e) => setDeprecationData({ ...deprecationData, end_of_life_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-slate-500">
                      {t({ en: 'Date when solution will no longer be available', ar: 'التاريخ الذي لن يكون فيه الحل متاحاً' })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Support End Date', ar: 'تاريخ انتهاء الدعم' })}</Label>
                    <Input
                      type="date"
                      value={deprecationData.support_end_date}
                      onChange={(e) => setDeprecationData({ ...deprecationData, support_end_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-slate-500">
                      {t({ en: 'When technical support will end', ar: 'متى سينتهي الدعم الفني' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="migration-support"
                    checked={deprecationData.migration_support_offered}
                    onChange={(e) => setDeprecationData({ ...deprecationData, migration_support_offered: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="migration-support" className="text-sm text-blue-900 cursor-pointer">
                    {t({ en: 'Offer migration support to affected municipalities', ar: 'تقديم دعم الترحيل للبلديات المتأثرة' })}
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Notification Message (EN)', ar: 'رسالة الإشعار (EN)' })}</Label>
                  <Textarea
                    value={deprecationData.notification_message_en}
                    onChange={(e) => setDeprecationData({ ...deprecationData, notification_message_en: e.target.value })}
                    rows={4}
                    placeholder="This solution will be deprecated effective..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Notification Message (AR)', ar: 'رسالة الإشعار (AR)' })}</Label>
                  <Textarea
                    value={deprecationData.notification_message_ar}
                    onChange={(e) => setDeprecationData({ ...deprecationData, notification_message_ar: e.target.value })}
                    rows={4}
                    placeholder="سيتم إيقاف هذا الحل اعتباراً من..."
                    dir="rtl"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    {t({ en: 'Deprecation Summary', ar: 'ملخص الإيقاف' })}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t({ en: 'Solution:', ar: 'الحل:' })}</span>
                      <span className="font-semibold">{solution.name_en}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t({ en: 'End of Life:', ar: 'نهاية الحياة:' })}</span>
                      <span className="font-semibold">{deprecationData.end_of_life_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t({ en: 'Support Until:', ar: 'الدعم حتى:' })}</span>
                      <span className="font-semibold">{deprecationData.support_end_date || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t({ en: 'Migration Support:', ar: 'دعم الترحيل:' })}</span>
                      <Badge className={deprecationData.migration_support_offered ? 'bg-green-600' : 'bg-red-600'}>
                        {deprecationData.migration_support_offered ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900">
                    {t({
                      en: 'Affected municipalities will be notified via email. Solution will be hidden from marketplace and marked as deprecated.',
                      ar: 'سيتم إشعار البلديات المتأثرة عبر البريد الإلكتروني. سيتم إخفاء الحل من السوق ووضع علامة إيقاف عليه.'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={step === 0 ? () => setOpen(false) : handleBack}>
              {step === 0 ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Back', ar: 'السابق' })}
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={handleNext}>
                {t({ en: 'Next', ar: 'التالي' })}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={deprecateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deprecateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Processing...', ar: 'جاري المعالجة...' })}
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t({ en: 'Deprecate Solution', ar: 'إيقاف الحل' })}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}