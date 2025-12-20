import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Building2, Users, BookOpen } from 'lucide-react';

export default function MunicipalOnboardingWizard({ scalingPlan, municipalityId, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    trainingScheduled: false,
    trainingDate: '',
    trainingAttendees: [],
    resourcesAllocated: false,
    contactPerson: '',
    contactEmail: '',
    infrastructureReady: false,
    notes: ''
  });

  const steps = [
    { id: 1, name: t({ en: 'Contact Setup', ar: 'إعداد جهة الاتصال' }), icon: Users },
    { id: 2, name: t({ en: 'Training', ar: 'التدريب' }), icon: BookOpen },
    { id: 3, name: t({ en: 'Resources', ar: 'الموارد' }), icon: Building2 },
    { id: 4, name: t({ en: 'Confirmation', ar: 'التأكيد' }), icon: CheckCircle2 }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete?.({
      municipalityId,
      scalingPlanId: scalingPlan?.id,
      ...onboardingData,
      completedDate: new Date().toISOString()
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Municipal Onboarding Wizard', ar: 'معالج تأهيل البلدية' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex flex-col items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs mt-2 text-center">{s.name}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${step > s.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-4 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>{t({ en: 'Contact Person', ar: 'الشخص المسؤول' })}</Label>
                <Input
                  value={onboardingData.contactPerson}
                  onChange={(e) => setOnboardingData({...onboardingData, contactPerson: e.target.value})}
                  placeholder={t({ en: 'Full name', ar: 'الاسم الكامل' })}
                />
              </div>
              <div>
                <Label>{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</Label>
                <Input
                  type="email"
                  value={onboardingData.contactEmail}
                  onChange={(e) => setOnboardingData({...onboardingData, contactEmail: e.target.value})}
                  placeholder={t({ en: 'email@municipality.gov.sa', ar: 'email@municipality.gov.sa' })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={onboardingData.trainingScheduled}
                  onChange={(e) => setOnboardingData({...onboardingData, trainingScheduled: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label>{t({ en: 'Training session scheduled', ar: 'تم جدولة جلسة التدريب' })}</Label>
              </div>
              {onboardingData.trainingScheduled && (
                <div>
                  <Label>{t({ en: 'Training Date', ar: 'تاريخ التدريب' })}</Label>
                  <Input
                    type="date"
                    value={onboardingData.trainingDate}
                    onChange={(e) => setOnboardingData({...onboardingData, trainingDate: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={onboardingData.resourcesAllocated}
                  onChange={(e) => setOnboardingData({...onboardingData, resourcesAllocated: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label>{t({ en: 'Resources allocated', ar: 'تم تخصيص الموارد' })}</Label>
              </div>
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={onboardingData.infrastructureReady}
                  onChange={(e) => setOnboardingData({...onboardingData, infrastructureReady: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label>{t({ en: 'Infrastructure ready', ar: 'البنية التحتية جاهزة' })}</Label>
              </div>
              <div>
                <Label>{t({ en: 'Notes', ar: 'ملاحظات' })}</Label>
                <Textarea
                  value={onboardingData.notes}
                  onChange={(e) => setOnboardingData({...onboardingData, notes: e.target.value})}
                  placeholder={t({ en: 'Additional notes', ar: 'ملاحظات إضافية' })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <h3 className="font-bold text-green-900">
                    {t({ en: 'Onboarding Summary', ar: 'ملخص التأهيل' })}
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t({ en: 'Contact:', ar: 'جهة الاتصال:' })}</span>
                    <span className="font-medium">{onboardingData.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t({ en: 'Training:', ar: 'التدريب:' })}</span>
                    <Badge className={onboardingData.trainingScheduled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {onboardingData.trainingScheduled ? t({ en: 'Scheduled', ar: 'مجدول' }) : t({ en: 'Pending', ar: 'معلق' })}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t({ en: 'Resources:', ar: 'الموارد:' })}</span>
                    <Badge className={onboardingData.resourcesAllocated ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {onboardingData.resourcesAllocated ? t({ en: 'Ready', ar: 'جاهزة' }) : t({ en: 'Pending', ar: 'معلقة' })}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            {t({ en: 'Back', ar: 'رجوع' })}
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext}>
              {t({ en: 'Next', ar: 'التالي' })}
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              {t({ en: 'Complete Onboarding', ar: 'إكمال التأهيل' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}