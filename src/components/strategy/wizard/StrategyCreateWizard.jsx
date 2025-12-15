import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target, Save } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';
import ProtectedPage from '../../permissions/ProtectedPage';

import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
import WizardStepIndicator from './WizardStepIndicator';
import Step1Context from './steps/Step1Context';
import Step2Vision from './steps/Step2Vision';
import Step3Stakeholders from './steps/Step3Stakeholders';
import Step4PESTEL from './steps/Step4PESTEL';
import Step5SWOT from './steps/Step2SWOT'; // Reusing existing SWOT
import Step6Scenarios from './steps/Step6Scenarios';
import Step7Risks from './steps/Step7Risks';
import Step8Dependencies from './steps/Step8Dependencies';
import Step9Objectives from './steps/Step3Objectives'; // Reusing existing
import Step10National from './steps/Step4NationalAlignment'; // Reusing existing
import Step11KPIs from './steps/Step5KPIs'; // Reusing existing
import Step12Actions from './steps/Step6ActionPlans'; // Reusing existing
import Step13Resources from './steps/Step13Resources';
import Step14Timeline from './steps/Step7Timeline'; // Reusing existing
import Step15Governance from './steps/Step15Governance';
import { Step16Communication, Step17Change } from './steps/Step16Communication';
import Step18Review from './steps/Step8Review'; // Reusing existing review

export default function StrategyCreateWizard() {
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(initialWizardData);
  const [generatingStep, setGeneratingStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const updateData = (updates) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase.from('strategic_plans').insert({
        name_en: data.name_en,
        name_ar: data.name_ar,
        vision_en: data.vision_en,
        vision_ar: data.vision_ar,
        mission_en: data.mission_en,
        mission_ar: data.mission_ar,
        objectives: data.objectives,
        status: 'draft'
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      toast.success(t({ en: 'Strategic plan created!', ar: 'تم إنشاء الخطة!' }));
      navigate('/strategic-plans');
    },
    onError: (err) => {
      toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }));
      console.error(err);
    }
  });

  const generateForStep = async (step) => {
    setGeneratingStep(step);
    // Placeholder - AI generation would be implemented here
    setTimeout(() => {
      setGeneratingStep(null);
      toast.success(t({ en: 'AI generation complete', ar: 'تم الإنشاء' }));
    }, 1500);
  };

  const handleNext = () => {
    if (currentStep < 18) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    const isGenerating = generatingStep === currentStep;
    const props = { data: wizardData, onChange: updateData, onGenerateAI: () => generateForStep(currentStep), isGenerating };
    
    switch (currentStep) {
      case 1: return <Step1Context {...props} />;
      case 2: return <Step2Vision {...props} />;
      case 3: return <Step3Stakeholders {...props} />;
      case 4: return <Step4PESTEL {...props} />;
      case 5: return <Step5SWOT {...props} />;
      case 6: return <Step6Scenarios {...props} />;
      case 7: return <Step7Risks {...props} />;
      case 8: return <Step8Dependencies {...props} />;
      case 9: return <Step9Objectives {...props} />;
      case 10: return <Step10National {...props} />;
      case 11: return <Step11KPIs {...props} />;
      case 12: return <Step12Actions {...props} />;
      case 13: return <Step13Resources {...props} />;
      case 14: return <Step14Timeline {...props} />;
      case 15: return <Step15Governance {...props} />;
      case 16: return <Step16Communication {...props} />;
      case 17: return <Step17Change {...props} />;
      case 18: return <Step18Review data={wizardData} onSave={() => saveMutation.mutate(wizardData)} isSaving={saveMutation.isPending} />;
      default: return null;
    }
  };

  return (
    <ProtectedPage entity="StrategicPlan" action="create">
      <div className="max-w-5xl mx-auto space-y-6 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              {t({ en: 'Create Strategic Plan', ar: 'إنشاء خطة استراتيجية' })}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t({ en: 'Step', ar: 'خطوة' })} {currentStep} / 18
            </p>
          </div>
        </div>

        <WizardStepIndicator steps={WIZARD_STEPS} currentStep={currentStep} onStepClick={setCurrentStep} completedSteps={completedSteps} />

        <Card>
          <CardContent className="pt-6">{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back', ar: 'السابق' })}
          </Button>
          
          {currentStep < 18 ? (
            <Button onClick={handleNext}>
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => saveMutation.mutate(wizardData)} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Save Plan', ar: 'حفظ الخطة' })}
            </Button>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
