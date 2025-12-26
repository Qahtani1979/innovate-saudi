import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategyMutations } from '@/hooks/useStrategyMutations';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target, Save } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';
import ProtectedPage from '../../permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { buildStrategyWizardPrompt, STRATEGY_WIZARD_SYSTEM_PROMPT } from '@/lib/ai/prompts/strategy/wizardPrompts';
import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
import WizardStepIndicator from './WizardStepIndicator';
import Step1Context from './steps/Step1Context';
import Step2Vision from './steps/Step2Vision';
import Step3Stakeholders from './steps/Step3Stakeholders';
import Step4PESTEL from './steps/Step4PESTEL';
import Step5SWOT from './steps/Step2SWOT'; // Note: File name matches import in original
import Step6Scenarios from './steps/Step6Scenarios';
import Step7Risks from './steps/Step7Risks';
import Step8Dependencies from './steps/Step8Dependencies';
import Step9Objectives from './steps/Step3Objectives'; // Note: File name matches import in original
import Step10National from './steps/Step4NationalAlignment';
import Step11KPIs from './steps/Step5KPIs';
import Step12Actions from './steps/Step6ActionPlans';
import Step13Resources from './steps/Step13Resources';
import Step14Timeline from './steps/Step7Timeline';
import Step15Governance from './steps/Step15Governance';
import Step16Communication from './steps/Step16Communication';
import Step17Change from './steps/Step17Change';
import Step18Review from './steps/Step18Review';

/**
 * ✅ GOLD STANDARD COMPLIANT - Uses only custom hooks
 */
function StrategyCreateWizardContent() {
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(initialWizardData);
  const [generatingStep, setGeneratingStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { invokeAI, isLoading: aiLoading, isAvailable: aiAvailable } = useAIWithFallback();

  const updateData = (updates) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const { createStrategy } = useStrategyMutations();

  const handleSave = () => {
    createStrategy.mutate({
      data: {
        name_en: wizardData.name_en,
        name_ar: wizardData.name_ar,
        vision_en: wizardData.vision_en,
        vision_ar: wizardData.vision_ar,
        mission_en: wizardData.mission_en,
        mission_ar: wizardData.mission_ar,
        objectives: wizardData.objectives,
        status: 'draft',
        target_sectors: wizardData.target_sectors,
        strategic_themes: wizardData.strategic_themes
      },
      metadata: {
        source: 'wizard',
        step_count: 18
      }
    }, {
      onSuccess: () => {
        // success toast handled by hook
        navigate('/strategic-plans');
      },
      onError: (err) => {
        // error log/toast handled by hook fallback
        console.error("Strategy creation failed", err);
      }
    });
  };

  const generateForStep = async (step) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return;
    }

    setGeneratingStep(step);
    const stepConfig = WIZARD_STEPS.find(s => s.num === step);
    const stepKey = stepConfig?.key || '';

    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      mission: wizardData.mission_en || wizardData.mission_ar || '',
      sectors: wizardData.target_sectors || [],
      themes: wizardData.strategic_themes || [],
      objectives: wizardData.objectives || []
    };

    const prompts = {
      vision: buildStrategyWizardPrompt('vision', context),
      stakeholders: buildStrategyWizardPrompt('stakeholders', context),
      pestel: buildStrategyWizardPrompt('pestel', context),
      swot: buildStrategyWizardPrompt('swot', context),
      scenarios: buildStrategyWizardPrompt('scenarios', context),
      risks: buildStrategyWizardPrompt('risks', context),
      objectives: buildStrategyWizardPrompt('objectives', context),
      kpis: buildStrategyWizardPrompt('kpis', context),
      actions: buildStrategyWizardPrompt('actions', context)
    };

    // Generic flexible schema to satisfy invokeAI requirements
    const stepSchema = {
      type: "object",
      properties: {
        vision_en: { type: "string" },
        vision_ar: { type: "string" },
        mission_en: { type: "string" },
        mission_ar: { type: "string" },
        stakeholders: { type: "array", items: { type: "object" } },
        pestel: { type: "object" },
        swot: { type: "object" },
        scenarios: { type: "array", items: { type: "object" } },
        risks: { type: "array", items: { type: "object" } },
        objectives: { type: "array", items: { type: "object" } },
        kpis: { type: "array", items: { type: "object" } },
        action_plans: { type: "array", items: { type: "object" } }
      }
    };

    try {
      const { success, data } = await invokeAI({
        prompt: prompts[stepKey] || buildStrategyWizardPrompt(stepKey, context),
        system_prompt: STRATEGY_WIZARD_SYSTEM_PROMPT,
        response_json_schema: stepSchema
      });

      if (success && data) {
        const updates = {};
        if (stepKey === 'vision') {
          if (data.vision_en) updates.vision_en = data.vision_en;
          if (data.vision_ar) updates.vision_ar = data.vision_ar;
          if (data.mission_en) updates.mission_en = data.mission_en;
          if (data.mission_ar) updates.mission_ar = data.mission_ar;
        } else if (stepKey === 'stakeholders' && data.stakeholders) {
          updates.stakeholders = data.stakeholders;
        } else if (stepKey === 'pestel') {
          updates.pestel = data;
        } else if (stepKey === 'swot') {
          updates.swot = data;
        } else if (stepKey === 'scenarios') {
          updates.scenarios = data;
        } else if (stepKey === 'risks' && data.risks) {
          updates.risks = data.risks;
        } else if (stepKey === 'objectives' && data.objectives) {
          updates.objectives = data.objectives;
        } else if (stepKey === 'kpis' && data.kpis) {
          updates.kpis = data.kpis;
        } else if (stepKey === 'actions' && data.action_plans) {
          updates.action_plans = data.action_plans;
        }

        if (Object.keys(updates).length > 0) {
          setWizardData(prev => ({ ...prev, ...updates }));
          toast.success(t({ en: 'AI generation complete', ar: 'تم الإنشاء بالذكاء الاصطناعي' }));
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setGeneratingStep(null);
    }
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
    const props = {
      data: wizardData,
      onChange: updateData,
      onGenerateAI: () => generateForStep(currentStep),
      isGenerating,
      isReadOnly: false,
      strategicPlanId: null,
      onGenerateSingleStakeholder: () => { }, // Fallback empty functions for optional props
      onGenerateSingleRisk: () => { },
      onGenerateSingleObjective: () => { },
      onGenerateSingleKpi: () => { },
      onGenerateSingleAction: () => { },
      onSubmitForApproval: () => { },
      isSubmitting: false,
      validationErrors: [],
      mode: 'create',
      sectors: wizardData.target_sectors || [], // Required by Step9Objectives?
      strategicThemes: wizardData.strategic_themes || []
    };

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
      case 12: return <Step12Actions {...props} strategicPlanId={null} wizardData={wizardData} />;
      case 13: return <Step13Resources {...props} strategicPlanId={null} />;
      case 14: return <Step14Timeline {...props} strategicPlanId={null} />;
      case 15: return <Step15Governance {...props} strategicPlanId={null} />;
      case 16: return <Step16Communication {...props} strategicPlanId={null} />;
      case 17: return <Step17Change {...props} strategicPlanId={null} />;
      case 18: return (
        <Step18Review
          data={wizardData}
          onSave={handleSave}
          onUpdatePlan={updateData}
          onNavigateToStep={setCurrentStep}
          isSaving={createStrategy.isPending}
        />
      );
      default: return null;
    }
  };

  return (
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
          <Button onClick={handleSave} disabled={createStrategy.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {t({ en: 'Save Plan', ar: 'حفظ الخطة' })}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(StrategyCreateWizardContent, {
  requiredPermissions: ['strategic_planning_create']
});
