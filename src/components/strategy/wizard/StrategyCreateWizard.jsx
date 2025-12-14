import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import ProtectedPage from '../../permissions/ProtectedPage';

import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
import WizardStepIndicator from './WizardStepIndicator';
import Step1Context from './steps/Step1Context';
import Step2SWOT from './steps/Step2SWOT';
import Step3Objectives from './steps/Step3Objectives';
import Step4NationalAlignment from './steps/Step4NationalAlignment';
import Step5KPIs from './steps/Step5KPIs';
import Step6ActionPlans from './steps/Step6ActionPlans';
import Step7Timeline from './steps/Step7Timeline';
import Step8Review from './steps/Step8Review';

export default function StrategyCreateWizard() {
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(initialWizardData);
  const [generatingStep, setGeneratingStep] = useState(null);
  
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const updateData = (updates) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.StrategicPlan.create({
      name_en: data.name_en,
      name_ar: data.name_ar,
      vision_en: data.vision_en,
      vision_ar: data.vision_ar,
      objectives: data.objectives,
      status: 'draft'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      toast.success(t({ en: 'Strategic plan created successfully!', ar: 'تم إنشاء الخطة الاستراتيجية بنجاح!' }));
      navigate('/strategic-plans');
    },
    onError: (err) => {
      toast.error(t({ en: 'Failed to save plan', ar: 'فشل في حفظ الخطة' }));
      console.error(err);
    }
  });

  const generateForStep = async (step) => {
    setGeneratingStep(step);
    try {
      // AI generation logic per step - simplified for now
      const prompts = {
        1: `Generate vision and mission for a MoMAH strategic plan titled "${wizardData.name_en}"`,
        2: `Generate SWOT analysis for Saudi municipal strategy: ${wizardData.name_en}`,
        3: `Generate 12-15 sector-specific strategic objectives for: ${wizardData.name_en}`,
        4: `Suggest national alignment for objectives`,
        5: `Generate KPIs for each objective`,
        6: `Generate action plans and initiatives`,
        7: `Generate timeline phases and milestones for ${wizardData.start_year}-${wizardData.end_year}`
      };

      const result = await invokeAI({ prompt: prompts[step] });
      if (result.success) {
        toast.success(t({ en: 'AI generation complete', ar: 'تم الإنشاء بالذكاء الاصطناعي' }));
      }
    } catch (err) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء بالذكاء الاصطناعي' }));
    } finally {
      setGeneratingStep(null);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!wizardData.name_en;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    const isGenerating = generatingStep === currentStep;
    
    switch (currentStep) {
      case 1: return <Step1Context data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(1)} isGenerating={isGenerating} />;
      case 2: return <Step2SWOT data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(2)} isGenerating={isGenerating} />;
      case 3: return <Step3Objectives data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(3)} isGenerating={isGenerating} />;
      case 4: return <Step4NationalAlignment data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(4)} isGenerating={isGenerating} />;
      case 5: return <Step5KPIs data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(5)} isGenerating={isGenerating} />;
      case 6: return <Step6ActionPlans data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(6)} isGenerating={isGenerating} />;
      case 7: return <Step7Timeline data={wizardData} onChange={updateData} onGenerateAI={() => generateForStep(7)} isGenerating={isGenerating} />;
      case 8: return <Step8Review data={wizardData} onSave={() => saveMutation.mutate(wizardData)} isSaving={saveMutation.isPending} />;
      default: return null;
    }
  };

  return (
    <ProtectedPage entity="StrategicPlan" action="create">
      <div className="max-w-5xl mx-auto space-y-6 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              {t({ en: 'Create Strategic Plan', ar: 'إنشاء خطة استراتيجية' })}
            </h1>
            <p className="text-muted-foreground mt-1">
              {WIZARD_STEPS[currentStep - 1]?.description[language]}
            </p>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>

        {/* Step Indicator */}
        <WizardStepIndicator 
          steps={WIZARD_STEPS} 
          currentStep={currentStep} 
          onStepClick={setCurrentStep} 
        />

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back', ar: 'السابق' })}
          </Button>
          
          {currentStep < 8 && (
            <Button onClick={handleNext} disabled={!canProceed()}>
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
