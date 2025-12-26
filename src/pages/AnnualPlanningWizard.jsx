import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function AnnualPlanningWizard() {
  const { language, isRTL, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: { en: 'Review Performance', ar: 'مراجعة الأداء' } },
    { id: 2, name: { en: 'Set Goals', ar: 'تحديد الأهداف' } },
    { id: 3, name: { en: 'Budget Allocation', ar: 'تخصيص الميزانية' } },
    { id: 4, name: { en: 'Define Initiatives', ar: 'تعريف المبادرات' } },
    { id: 5, name: { en: 'Approval', ar: 'الموافقة' } }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: '2026 Annual Planning Wizard', ar: 'معالج التخطيط السنوي 2026' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Structured annual strategic planning process', ar: 'عملية تخطيط استراتيجي سنوي منظم' })}
        </p>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    step.id < currentStep ? 'bg-green-600' : step.id === currentStep ? 'bg-blue-600' : 'bg-slate-200'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <span className={`text-sm font-bold ${step.id === currentStep ? 'text-white' : 'text-slate-600'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 text-center">{step.name[language]}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step.id < currentStep ? 'bg-green-600' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1]?.name[language]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">
                {t({ en: 'Review 2025 performance metrics and identify achievements and gaps', ar: 'مراجعة مقاييس أداء 2025 وتحديد الإنجازات والفجوات' })}
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center py-8">
              <p className="text-slate-600">
                {t({ en: 'Define 2026 objectives based on identified gaps', ar: 'تعريف أهداف 2026 بناءً على الفجوات المحددة' })}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Previous', ar: 'السابق' })}
            </Button>
            <Badge variant="outline">
              {t({ en: 'Step', ar: 'الخطوة' })} {currentStep}/5
            </Badge>
            <Button
              onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
              disabled={currentStep === 5}
            >
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(AnnualPlanningWizard, { requiredPermissions: [] });
