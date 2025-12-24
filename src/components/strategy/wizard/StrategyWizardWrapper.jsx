/* @refresh reset */
import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft, ChevronRight, Target, Save, FolderOpen,
  AlertCircle, Clock, Send, Loader2, RotateCcw, FileText
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { toast } from 'sonner';
import { useAutoSaveDraft } from '@/hooks/strategy/useAutoSaveDraft';
import { useWizardValidation } from '@/hooks/strategy/useWizardValidation';
// NOTE: templates are applied via a lightweight helper in this file to avoid hook dispatcher crashes
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
import WizardStepIndicator from './WizardStepIndicator';
import { CompactStepIndicator } from './shared';
import PlanSelectionDialog from './PlanSelectionDialog';
import SaveAsTemplateDialog from '../templates/SaveAsTemplateDialog';
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
import { useStrategyAI } from '@/hooks/strategy/useStrategyAI'; // New Import
import { useStrategyMutations } from '@/hooks/useStrategyMutations'; // Corrected path

/**
 * StrategyWizardWrapper
 * 
 * Unified wrapper component for strategic plan wizard supporting:
 * - Create mode: New plan creation with draft auto-save
 * - Edit mode: Edit existing plan with version control
 * - Review mode: Read-only review of submitted plans
 * - Template mode: Start from a template
 */
export default function StrategyWizardWrapper() {
  const { language, t, isRTL } = useLanguage();
  const {
    sectors,
    regions,
    strategicThemes,
    technologies,
    visionPrograms,
    stakeholderTypes,
    riskCategories
  } = useTaxonomy();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { fetchTemplate, createStrategy, updateStrategy, submitStrategy } = useStrategyMutations();

  // Apply template without react-query hooks (prevents "dispatcher is null" hook crashes)
  const applyTemplate = useCallback(async (templateId) => {
    const template = await fetchTemplate(templateId);

    if (!template) throw new Error('Template not found');

    return {
      // Basic info - clear for customization
      name_en: '',
      name_ar: '',
      description_en: template.description_en || '',
      description_ar: template.description_ar || '',

      // Copy template content
      vision_en: template.vision_en || '',
      vision_ar: template.vision_ar || '',
      mission_en: template.mission_en || '',
      mission_ar: template.mission_ar || '',
      core_values: template.core_values || [],
      strategic_pillars: template.strategic_pillars || template.pillars || [],

      // Analysis
      stakeholders: template.stakeholders || [],
      pestel: template.pestel || {},
      swot: template.swot || {},
      scenarios: template.scenarios || {},
      risks: template.risks || [],
      dependencies: template.dependencies || [],
      constraints: template.constraints || [],

      // Strategy
      objectives: template.objectives || [],
      national_alignments: template.national_alignments || [],
      kpis: template.kpis || [],
      action_plans: template.action_plans || [],
      resource_plan: template.resource_plan || {},

      // Implementation
      milestones: template.milestones || [],
      phases: template.phases || [],
      governance: template.governance || {},
      communication_plan: template.communication_plan || {},
      change_management: template.change_management || {},

      // Context - reset for new plan
      start_year: new Date().getFullYear(),
      end_year: new Date().getFullYear() + 5,
      target_sectors: template.target_sectors || [],
      target_regions: template.target_regions || [],
      strategic_themes: template.strategic_themes || [],
      focus_technologies: template.focus_technologies || [],
      vision_2030_programs: template.vision_2030_programs || [],
      budget_range: template.budget_range || '',

      // Meta
      _sourceTemplateId: template.id,
      _sourceTemplateName: template.name_en,
    };
  }, []);

  // Mode and plan state
  const [mode, setMode] = useState('create'); // 'create' | 'edit' | 'review'
  const [planId, setPlanId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(initialWizardData);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [appliedTemplateName, setAppliedTemplateName] = useState(null);

  // Validation hook - pass t function to avoid nested context issues
  const { validateStep, hasStepData, calculateProgress } = useWizardValidation(wizardData, t);

  // Auto-save hook with planId sync
  const {
    scheduleAutoSave,
    saveNow,
    loadLocalDraft,
    clearLocalDraft,
    loadPlan,
    hasDraft,
    lastSaved,
    isSaving,
    currentPlanId
  } = useAutoSaveDraft({
    planId,
    mode,
    enabled: mode !== 'review',
    onPlanIdChange: (newId) => {
      console.log('[Wizard] Plan ID updated:', newId);
      setPlanId(newId);
    }
  });

  // Update data with auto-save
  const updateData = useCallback((updates) => {
    setWizardData(prev => {
      const newData = { ...prev, ...updates };
      scheduleAutoSave(newData, currentStep);
      return newData;
    });
  }, [scheduleAutoSave, currentStep]);

  // AI Hook - Replaces local logic
  const {
    generatingStep,
    generateForStep,
    generateSingleObjective,
    generateSingleStakeholder,
    generateSingleRisk,
    generateSingleKpi,
    generateSingleAction,
    aiAvailable
  } = useStrategyAI({
    wizardData,
    updateData,
    sectors,
    planId
  });

  // Initialize from URL params or detect draft
  useEffect(() => {
    const urlPlanId = searchParams.get('id');
    const urlMode = searchParams.get('mode');
    const templateId = searchParams.get('template');

    if (templateId) {
      // Apply template
      applyTemplate(templateId).then(templateData => {
        if (templateData) {
          setWizardData({ ...initialWizardData, ...templateData });
          setAppliedTemplateName(templateData._sourceTemplateName);
          setMode('create');
          // Clear template param from URL
          setSearchParams({});
          toast.success(`Template "${templateData._sourceTemplateName}" applied`);
        }
      }).catch(err => {
        console.error('Failed to apply template:', err);
      });
    } else if (urlPlanId) {
      setPlanId(urlPlanId);
      setMode(urlMode || 'edit');
      loadPlan(urlPlanId).then(plan => {
        if (plan) {
          const mergedData = {
            ...initialWizardData,
            ...plan,
            ...(plan.draft_data || {})
          };
          setWizardData(mergedData);
          if (plan.last_saved_step) {
            setCurrentStep(plan.last_saved_step);
          }
        }
      });
    } else if (hasDraft) {
      setShowDraftRecovery(true);
    }
  }, [searchParams, hasDraft, loadPlan, applyTemplate]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Prepare payload (same as before)
      const saveData = {
        name_en: data.name_en,
        name_ar: data.name_ar,
        description_en: data.description_en,
        description_ar: data.description_ar,
        vision_en: data.vision_en,
        vision_ar: data.vision_ar,
        mission_en: data.mission_en,
        mission_ar: data.mission_ar,
        start_year: data.start_year,
        end_year: data.end_year,
        objectives: data.objectives || [],
        kpis: data.kpis || [],
        pillars: data.strategic_pillars || [],
        stakeholders: data.stakeholders || [],
        pestel: data.pestel || {},
        swot: data.swot || {},
        scenarios: data.scenarios || {},
        risks: data.risks || [],
        dependencies: data.dependencies || [],
        constraints: data.constraints || [],
        national_alignments: data.national_alignments || [],
        action_plans: data.action_plans || [],
        resource_plan: data.resource_plan || {},
        milestones: data.milestones || [],
        phases: data.phases || [],
        governance: data.governance || {},
        communication_plan: data.communication_plan || {},
        change_management: data.change_management || {},
        target_sectors: data.target_sectors || [],
        target_regions: data.target_regions || [],
        strategic_themes: data.strategic_themes || [],
        focus_technologies: data.focus_technologies || [],
        vision_2030_programs: data.vision_2030_programs || [],
        budget_range: data.budget_range,
        core_values: data.core_values || [],
        strategic_pillars: data.strategic_pillars || [],
        last_saved_step: 18,
        draft_data: data,
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      if (planId) {
        // Update existing
        if (mode === 'edit') {
          saveData.version_number = (data.version_number || 1) + 1;
          saveData.version_notes = `Edited on ${new Date().toLocaleString()}`;
        }

        const { result } = await updateStrategy.mutateAsync({
          id: planId,
          data: saveData,
          metadata: { activity_type: 'update_draft' }
        });
        return result;
      } else {
        // Create new
        const { result } = await createStrategy.mutateAsync({
          data: saveData,
          metadata: { activity_type: 'create_draft' }
        });
        return result;
      }
    },
    onSuccess: (result) => {
      // queryClient invalidation is handled by useStrategyMutations
      clearLocalDraft();
      // toast is handled by useStrategyMutations
      setPlanId(result.id);
    },
    onError: (err) => {
      // toast is handled by useStrategyMutations
      console.error(err);
    }
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // First save the plan using our wrapper saveMutation
      const saveResult = await saveMutation.mutateAsync(data);

      await submitStrategy.mutateAsync({
        id: saveResult.id,
        data: data,
        userEmail: data.owner_email || 'system' // Fallback
      });

      return saveResult;
    },
    onSuccess: () => {
      clearLocalDraft();
      navigate('/strategic-plans-page');
    }
  });

  const handleNext = async () => {
    if (currentStep < 18) {
      // Validate current step before proceeding
      const validation = validateStep(currentStep);
      if (!validation.isValid && currentStep <= 2) {
        // Only enforce validation for critical steps 1-2
        validation.errors.forEach(err => {
          toast.error(err.message);
        });
        return;
      }

      // Save current step data immediately before navigating
      // This will create a new plan if planId doesn't exist yet
      if (mode !== 'review') {
        try {
          const result = await saveNow(wizardData, currentStep);
          if (result.success) {
            console.log('[Navigation] Save successful, planId:', result.planId);
          }
        } catch (err) {
          console.warn('Failed to save on navigation:', err);
        }
      }

      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      // Save current step data immediately before navigating
      if (mode !== 'review') {
        try {
          await saveNow(wizardData, currentStep);
        } catch (err) {
          console.warn('Failed to save on navigation:', err);
        }
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectPlan = (plan, selectedMode) => {
    setPlanId(plan.id);
    setMode(selectedMode);
    setSearchParams({ id: plan.id, mode: selectedMode });

    const mergedData = {
      ...initialWizardData,
      ...plan,
      ...(plan.draft_data || {})
    };
    setWizardData(mergedData);

    if (plan.last_saved_step) {
      setCurrentStep(plan.last_saved_step);
    }
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
      // Explicitly set planId if draft has one saved
      if (draft._planId && !planId) {
        setPlanId(draft._planId);
        setMode('edit'); // Switch to edit mode since plan exists in DB
      }

      // Remove internal fields before merging
      const { _savedAt, _savedStep, _planId: draftPlanId, ...draftData } = draft;
      setWizardData({ ...initialWizardData, ...draftData });

      if (_savedStep) {
        const step = Number(_savedStep);
        if (Number.isFinite(step) && step >= 1 && step <= 18) {
          setCurrentStep(step);
        }
      }
      toast.success(t({ en: 'Draft recovered', ar: 'تم استرداد المسودة' }));
    }
    setShowDraftRecovery(false);
  };

  const handleDiscardDraft = () => {
    clearLocalDraft();
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
          onSave={() => saveMutation.mutate(wizardData)}
          onSubmitForApproval={() => submitMutation.mutate(wizardData)}
          onUpdatePlan={updateData}
          onNavigateToStep={setCurrentStep}
          isSaving={saveMutation.isPending}
          isSubmitting={submitMutation.isPending}
          mode={mode}
        />
      );
      default: return null;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'edit': return t({ en: 'Editing', ar: 'تعديل' });
      case 'review': return t({ en: 'Reviewing', ar: 'مراجعة' });
      default: return t({ en: 'Creating', ar: 'إنشاء' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Draft Recovery Alert */}
      {showDraftRecovery && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t({ en: 'You have an unsaved draft. Would you like to recover it?', ar: 'لديك مسودة غير محفوظة. هل تريد استردادها؟' })}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDiscardDraft}>
                {t({ en: 'Discard', ar: 'تجاهل' })}
              </Button>
              <Button size="sm" onClick={handleRecoverDraft}>
                <RotateCcw className="h-4 w-4 mr-1" />
                {t({ en: 'Recover', ar: 'استرداد' })}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            {t({ en: 'Strategic Plan', ar: 'الخطة الاستراتيجية' })}
            <Badge variant={mode === 'review' ? 'secondary' : 'default'}>
              {getModeLabel()}
            </Badge>
          </h1>
          <div className="flex items-center gap-4 mt-1 text-muted-foreground">
            <span>{t({ en: 'Step', ar: 'خطوة' })} {currentStep} / 18</span>
            {lastSaved && (
              <span className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {t({ en: 'Last saved', ar: 'آخر حفظ' })}: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isSaving && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {appliedTemplateName && (
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {appliedTemplateName}
            </Badge>
          )}
          <PlanSelectionDialog
            onSelectPlan={handleSelectPlan}
            onCreateNew={handleCreateNew}
            trigger={
              <Button variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                {t({ en: 'Open Plan', ar: 'فتح خطة' })}
              </Button>
            }
          />
        </div>
      </div>

      <WizardStepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={async (step) => {
          // Save current data before jumping to another step
          if (mode !== 'review' && step !== currentStep) {
            try {
              await saveNow(wizardData, currentStep);
            } catch (err) {
              console.warn('Failed to save on step click:', err);
            }
          }
          setCurrentStep(step);
        }}
        completedSteps={completedSteps}
      />

      {/* Compact Top Navigation */}
      <CompactStepIndicator
        currentStep={currentStep}
        totalSteps={18}
        stepTitle={WIZARD_STEPS.find(s => s.num === currentStep)?.title}
        onBack={handleBack}
        onNext={handleNext}
        language={language}
      />

      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t({ en: 'Back', ar: 'السابق' })}
        </Button>

        <div className="flex gap-2">
          {mode !== 'review' && currentStep === 18 && (
            <SaveAsTemplateDialog
              planData={wizardData}
              trigger={
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  {t({ en: 'Save as Template', ar: 'حفظ كقالب' })}
                </Button>
              }
            />
          )}
          {mode !== 'review' && (
            <Button
              variant="outline"
              onClick={async () => {
                const result = await saveNow(wizardData, currentStep);
                if (result.success) {
                  toast.success(t({ en: 'Draft saved successfully', ar: 'تم حفظ المسودة بنجاح' }));
                } else {
                  toast.error(t({ en: 'Failed to save draft', ar: 'فشل في حفظ المسودة' }));
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t({ en: 'Save Draft', ar: 'حفظ المسودة' })}
            </Button>
          )}

          {currentStep < 18 ? (
            <Button onClick={handleNext}>
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : mode !== 'review' && (
            <Button
              onClick={() => submitMutation.mutate(wizardData)}
              disabled={submitMutation.isPending || !wizardData.name_en}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
            </Button>
          )}
        </div>
      </div>

      {/* AI Plan Analyzer Section */}
      <AIStrategicPlanAnalyzer
        planData={wizardData}
        onNavigateToStep={setCurrentStep}
        onApplySuggestion={async (type, suggestion) => {
          // Handle applying AI suggestions to the plan
          console.log('Applying suggestion:', type, suggestion);
          toast.info(t({ en: 'Suggestion noted - implement in relevant step', ar: 'تم ملاحظة الاقتراح - نفذه في الخطوة المناسبة' }));
        }}
        onCreateTask={async (task) => {
          // Handle creating tasks from recommendations
          console.log('Creating task:', task);
          toast.success(t({ en: 'Task created successfully', ar: 'تم إنشاء المهمة بنجاح' }));
        }}
      />
    </div>
  );
}
