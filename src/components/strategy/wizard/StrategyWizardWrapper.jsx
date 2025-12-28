/* @refresh reset */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Target, Save, FolderOpen,
  AlertCircle, Loader2
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useAutoSaveDraft } from '@/hooks/strategy/useAutoSaveDraft';
import { useWizardValidation } from '@/hooks/strategy/useWizardValidation';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
import WizardStepIndicator from './WizardStepIndicator';
import { CompactStepIndicator } from './shared';
import PlanSelectionDialog from './PlanSelectionDialog';
import Step1Context from './steps/Step1Context';
import Step2Vision from './steps/Step2Vision';
import Step3Stakeholders from './steps/Step3Stakeholders';
import Step4PESTEL from './steps/Step4PESTEL';
import Step5SWOT from './steps/Step2SWOT';
import Step6Scenarios from './steps/Step6Scenarios';
import Step7Risks from './steps/Step7Risks';
import Step8Dependencies from './steps/Step8Dependencies';
import Step9Objectives from './steps/Step3Objectives';
import Step10National from './steps/Step4NationalAlignment';
import Step11KPIs from './steps/Step5KPIs';
import Step12Actions from './steps/Step6ActionPlans';
import Step13Resources from './steps/Step13Resources';
import Step14Timeline from './steps/Step7Timeline';
import Step15Governance from './steps/Step15Governance';
import Step16Communication from './steps/Step16Communication';
import Step17Change from './steps/Step17Change';
import Step18Review from './steps/Step18Review';
import AIStrategicPlanAnalyzer from './AIStrategicPlanAnalyzer';
import { useStrategyAI } from '@/hooks/strategy/useStrategyAI';
import { useStrategyMutations } from '@/hooks/useStrategyMutations';

/**
 * StrategyWizardWrapper
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function StrategyWizardWrapper() {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const {
    sectors,
    strategicThemes
  } = useTaxonomy();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    fetchTemplate,
    wizardSave,
    wizardSubmit
  } = useStrategyMutations();

  const [mode, setMode] = useState('create');
  const [planId, setPlanId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(initialWizardData);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [appliedTemplateName, setAppliedTemplateName] = useState(null);

  const { validateStep } = useWizardValidation(wizardData, t);

  const {
    scheduleAutoSave,
    saveNow,
    loadLocalDraft,
    clearLocalDraft,
    hasDraft,
    lastSaved,
    isSaving
  } = useAutoSaveDraft({
    planId,
    mode,
    enabled: mode !== 'review',
    onPlanIdChange: (newId) => setPlanId(newId)
  });

  const updateData = useCallback((updates) => {
    setWizardData(prev => {
      const newData = { ...prev, ...updates };
      scheduleAutoSave(newData, currentStep);
      return newData;
    });
  }, [scheduleAutoSave, currentStep]);

  const {
    generatingStep,
    generateForStep,
    generateSingleObjective,
    generateSingleStakeholder,
    generateSingleRisk,
    generateSingleKpi,
    generateSingleAction
  } = useStrategyAI({
    wizardData,
    updateData,
    sectors,
    planId
  });

  useEffect(() => {
    const urlPlanId = searchParams.get('id');
    const urlMode = searchParams.get('mode');
    const templateId = searchParams.get('template');

    if (templateId) {
      fetchTemplate(templateId).then(template => {
        if (template) {
          setWizardData({ ...initialWizardData, ...template, name_en: '', name_ar: '' });
          setAppliedTemplateName(template.name_en);
          setMode('create');
          setSearchParams({});
          toast.success(`Template applied`);
        }
      });
    } else if (urlPlanId) {
      setPlanId(urlPlanId);
      setMode(urlMode || 'edit');
      // Loading handled by auto-save loadPlan if needed, but here we just wait for data
    } else if (hasDraft) {
      setShowDraftRecovery(true);
    }
  }, [searchParams, hasDraft, fetchTemplate]);

  const handleNext = async () => {
    if (currentStep < 18) {
      if (mode !== 'review') await saveNow(wizardData, currentStep);
      if (!completedSteps.includes(currentStep)) setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      if (mode !== 'review') await saveNow(wizardData, currentStep);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectPlan = (plan, selectedMode) => {
    setPlanId(plan.id);
    setMode(selectedMode);
    setSearchParams({ id: plan.id, mode: selectedMode });
    setWizardData({ ...initialWizardData, ...plan, ...(plan.draft_data || {}) });
    if (plan.last_saved_step) setCurrentStep(plan.last_saved_step);
  };

  const handleCreateNew = () => {
    setPlanId(null);
    setMode('create');
    setWizardData(initialWizardData);
    setCurrentStep(1);
    setCompletedSteps([]);
    setSearchParams({});
    clearLocalDraft();
  };

  const handleRecoverDraft = () => {
    const draft = loadLocalDraft();
    if (draft) {
      setWizardData({ ...initialWizardData, ...draft });
      if (draft._savedStep) setCurrentStep(Number(draft._savedStep));
      toast.success(t({ en: 'Draft recovered', ar: 'تم استرداد المسودة' }));
    }
    setShowDraftRecovery(false);
  };

  const renderStep = () => {
    const isGenerating = generatingStep === currentStep;
    const isReadOnly = mode === 'review';
    const props = {
      data: wizardData,
      onChange: isReadOnly ? () => { } : updateData,
      onGenerateAI: () => generateForStep(currentStep),
      isGenerating,
      isReadOnly
    };

    switch (currentStep) {
      case 1: return <Step1Context {...props} />;
      case 2: return <Step2Vision {...props} />;
      case 3: return <Step3Stakeholders {...props} onGenerateSingleStakeholder={generateSingleStakeholder} />;
      case 4: return <Step4PESTEL {...props} />;
      case 5: return <Step5SWOT {...props} />;
      case 6: return <Step6Scenarios {...props} />;
      case 7: return <Step7Risks {...props} onGenerateSingleRisk={generateSingleRisk} />;
      case 8: return <Step8Dependencies {...props} />;
      case 9: return <Step9Objectives {...props} wizardData={wizardData} sectors={sectors} strategicThemes={strategicThemes} onGenerateSingleObjective={generateSingleObjective} />;
      case 10: return <Step10National {...props} />;
      case 11: return <Step11KPIs {...props} onGenerateSingleKpi={generateSingleKpi} />;
      case 12: return <Step12Actions {...props} strategicPlanId={planId} wizardData={wizardData} onGenerateSingleAction={generateSingleAction} />;
      case 13: return <Step13Resources {...props} strategicPlanId={planId} />;
      case 14: return <Step14Timeline {...props} strategicPlanId={planId} />;
      case 15: return <Step15Governance {...props} strategicPlanId={planId} />;
      case 16: return <Step16Communication {...props} strategicPlanId={planId} />;
      case 17: return <Step17Change {...props} strategicPlanId={planId} />;
      case 18: return (
        <Step18Review
          data={wizardData}
          onSave={() => wizardSave.mutate({ id: planId, data: wizardData, mode: 'edit' })}
          onSubmitForApproval={() => wizardSubmit.mutate({ id: planId, data: wizardData, userEmail: user?.email })}
          onUpdatePlan={updateData}
          onNavigateToStep={setCurrentStep}
          isSaving={wizardSave.isPending}
          isSubmitting={wizardSubmit.isPending}
          mode={mode}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {showDraftRecovery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800">{t({ en: 'You have an unsaved draft. Would you like to recover it?', ar: 'لديك مسودة غير محفوظة. هل تريد استردادها؟' })}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDiscardDraft}>Discard</Button>
            <Button size="sm" onClick={handleRecoverDraft}>Recover</Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          {t({ en: 'Strategic Plan', ar: 'الخطة الاستراتيجية' })}
          <Badge variant={mode === 'review' ? 'secondary' : 'default'}>
            {mode.toUpperCase()}
          </Badge>
        </h1>
        <div className="flex gap-2">
          <PlanSelectionDialog
            onSelectPlan={handleSelectPlan}
            onCreateNew={handleCreateNew}
            trigger={<Button variant="outline"><FolderOpen className="h-4 w-4 mr-2" />Open</Button>}
          />
        </div>
      </div>

      <WizardStepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        completedSteps={completedSteps}
      />

      <CompactStepIndicator
        currentStep={currentStep}
        totalSteps={18}
        stepTitle={WIZARD_STEPS.find(s => s.num === currentStep)?.title}
        onBack={handleBack}
        onNext={handleNext}
        language={language}
        className="mb-4"
      />

      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />Back
        </Button>

        <div className="flex gap-2">
          {mode !== 'review' && (
            <Button
              variant="outline"
              onClick={() => saveNow(wizardData, currentStep)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
          )}

          {currentStep < 18 ? (
            <Button onClick={handleNext}>Next<ChevronRight className="h-4 w-4 ml-2" /></Button>
          ) : mode !== 'review' && (
            <Button
              onClick={() => wizardSubmit.mutate({ id: planId, data: wizardData, userEmail: user?.email })}
              disabled={wizardSubmit.isPending || !wizardData.name_en}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit
            </Button>
          )}
        </div>
      </div>

      <AIStrategicPlanAnalyzer
        planData={wizardData}
        onNavigateToStep={setCurrentStep}
      />
    </div>
  );
}
