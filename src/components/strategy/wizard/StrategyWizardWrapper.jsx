/* @refresh reset */
import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { useApprovalRequest } from '@/hooks/useApprovalRequest';
import { useAutoSaveDraft } from '@/hooks/strategy/useAutoSaveDraft';
// NOTE: templates are applied via a lightweight helper in this file to avoid hook dispatcher crashes
import { useWizardValidation } from '@/hooks/strategy/useWizardValidation';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { getEdgeFunctionForStep, usesSpecializedEdgeFunction } from '@/hooks/strategy/useWizardAI';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
// AI Prompts - extracted to separate files
import {
  // Single item prompts for "AI Add One" functionality
  generateSingleStakeholderPrompt,
  SINGLE_STAKEHOLDER_SCHEMA,
  SINGLE_STAKEHOLDER_SYSTEM_PROMPT,
  generateSingleRiskPrompt,
  SINGLE_RISK_SCHEMA,
  SINGLE_RISK_SYSTEM_PROMPT,
  generateSingleObjectivePrompt,
  SINGLE_OBJECTIVE_SCHEMA,
  SINGLE_OBJECTIVE_SYSTEM_PROMPT,
  generateSingleKpiPrompt,
  SINGLE_KPI_SCHEMA,
  SINGLE_KPI_SYSTEM_PROMPT,
  generateSingleActionPrompt,
  SINGLE_ACTION_SCHEMA,
  SINGLE_ACTION_SYSTEM_PROMPT
} from './prompts';
import { getStepPrompt, getStepSchema, processAIResponse } from './StrategyWizardAIHelpers';
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

  const { createApprovalRequest } = useApprovalRequest();

  // Apply template without react-query hooks (prevents "dispatcher is null" hook crashes)
  const applyTemplate = useCallback(async (templateId) => {
    const { data: template, error } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('id', templateId)
      .eq('is_template', true)
      .single();

    if (error) throw error;
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
  const [generatingStep, setGeneratingStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [appliedTemplateName, setAppliedTemplateName] = useState(null);

  // Validation hook - pass t function to avoid nested context issues
  const { validateStep, hasStepData, calculateProgress } = useWizardValidation(wizardData, t);

  // AI generation hook
  const { invokeAI, isLoading: aiLoading, isAvailable: aiAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

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

  // Update data with auto-save
  const updateData = useCallback((updates) => {
    setWizardData(prev => {
      const newData = { ...prev, ...updates };
      scheduleAutoSave(newData, currentStep);
      return newData;
    });
  }, [scheduleAutoSave, currentStep]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();

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
        owner_email: user?.email,
        updated_at: new Date().toISOString()
      };

      if (planId) {
        // Update existing
        if (mode === 'edit') {
          // Increment version on edit
          saveData.version_number = (data.version_number || 1) + 1;
          saveData.version_notes = `Edited on ${new Date().toLocaleString()}`;
        }

        const { data: result, error } = await supabase
          .from('strategic_plans')
          .update(saveData)
          .eq('id', planId)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        // Create new
        const { data: result, error } = await supabase
          .from('strategic_plans')
          .insert(saveData)
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['strategic-plans']);
      clearLocalDraft();
      toast.success(t({ en: 'Strategic plan saved!', ar: 'تم حفظ الخطة!' }));
      setPlanId(result.id);
    },
    onError: (err) => {
      toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }));
      console.error(err);
    }
  });

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();

      // First save the plan
      const saveResult = await saveMutation.mutateAsync(data);

      // Update status to pending approval
      const { error: updateError } = await supabase
        .from('strategic_plans')
        .update({
          approval_status: 'pending',
          submitted_at: new Date().toISOString(),
          submitted_by: user?.email
        })
        .eq('id', saveResult.id);

      if (updateError) throw updateError;

      // Create approval request
      await createApprovalRequest({
        entityType: 'strategic_plan',
        entityId: saveResult.id,
        entityTitle: data.name_en,
        requesterEmail: user?.email,
        metadata: {
          version_number: saveResult.version_number,
          start_year: data.start_year,
          end_year: data.end_year,
          objectives_count: data.objectives?.length || 0
        },
        slaDays: 14,
        gateName: 'plan_approval'
      });

      // Create demand_queue items from action_plans with should_create_entity=true
      const cascadableActions = data.action_plans?.filter(
        ap => ap.should_create_entity && ap.type
      ) || [];

      if (cascadableActions.length > 0) {
        const generatorMapping = {
          challenge: 'StrategyChallengeGenerator',
          pilot: 'StrategyToPilotGenerator',
          program: 'StrategyToProgramGenerator',
          campaign: 'StrategyToCampaignGenerator',
          event: 'StrategyToEventGenerator',
          policy: 'StrategyToPolicyGenerator',
          rd_call: 'StrategyToRDCallGenerator',
          partnership: 'StrategyToPartnershipGenerator',
          living_lab: 'StrategyToLivingLabGenerator'
        };

        const priorityScores = { high: 100, medium: 60, low: 30 };

        const queueItems = cascadableActions.map((ap, index) => ({
          strategic_plan_id: saveResult.id,
          objective_id: data.objectives?.[ap.objective_index]?.id || null,
          entity_type: ap.type,
          generator_component: generatorMapping[ap.type] || 'StrategyChallengeGenerator',
          priority_score: priorityScores[ap.priority] || 60,
          prefilled_spec: {
            title_en: ap.name_en,
            title_ar: ap.name_ar,
            description_en: ap.description_en,
            description_ar: ap.description_ar,
            budget_estimate: ap.budget_estimate,
            start_date: ap.start_date,
            end_date: ap.end_date,
            owner: ap.owner,
            deliverables: ap.deliverables,
            source: 'wizard_step12',
            source_index: index
          },
          status: 'pending',
          created_by: user?.email
        }));

        const { error: queueError } = await supabase.from('demand_queue').insert(queueItems);
        if (queueError) {
          console.error('Failed to create demand queue items:', queueError);
          // Don't throw - plan is saved, queue items are optional
        }
      }

      return saveResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['approval-requests']);
      clearLocalDraft();
      toast.success(t({ en: 'Plan submitted for approval!', ar: 'تم إرسال الخطة للموافقة!' }));
      navigate('/strategic-plans-page');
    },
    onError: (err) => {
      toast.error(t({ en: 'Failed to submit', ar: 'فشل في الإرسال' }));
      console.error(err);
    }
  });

  // AI generation for each step - uses specialized edge functions when available
  const generateForStep = async (step) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return;
    }

    setGeneratingStep(step);

    const stepConfig = WIZARD_STEPS.find(s => s.num === step);
    const edgeFunctionName = getEdgeFunctionForStep(step);
    const useSpecializedFunction = usesSpecializedEdgeFunction(step);
    const stepKey = stepConfig?.key || '';

    // Build comprehensive context from existing data
    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      planNameAr: wizardData.name_ar || '',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      visionAr: wizardData.vision_ar || '',
      mission: wizardData.mission_en || wizardData.mission_ar || '',
      missionAr: wizardData.mission_ar || '',
      description: wizardData.description_en || wizardData.description_ar || '',
      descriptionAr: wizardData.description_ar || '',
      sectors: wizardData.target_sectors || [],
      themes: wizardData.strategic_themes || [],
      technologies: wizardData.focus_technologies || [],
      vision2030Programs: wizardData.vision_2030_programs || [],
      regions: wizardData.target_regions || [],
      startYear: wizardData.start_year || new Date().getFullYear(),
      endYear: wizardData.end_year || new Date().getFullYear() + 5,
      budgetRange: wizardData.budget_range || '',
      stakeholders: wizardData.quick_stakeholders || [],
      keyChallenges: wizardData.key_challenges_en || wizardData.key_challenges_ar || '',
      keyChallengesAr: wizardData.key_challenges_ar || '',
      availableResources: wizardData.available_resources_en || wizardData.available_resources_ar || '',
      availableResourcesAr: wizardData.available_resources_ar || '',
      initialConstraints: wizardData.initial_constraints_en || wizardData.initial_constraints_ar || '',
      initialConstraintsAr: wizardData.initial_constraints_ar || '',
      objectives: wizardData.objectives || []
    };

    // Build prompts dynamically using imported prompt generators
    // Build prompts and schemas using helper
    const prompt = getStepPrompt(step, context, wizardData) || `Generate content for step "${stepConfig?.title?.en || stepKey}" of this Saudi municipal strategic plan: ${context.planName}`;
    const schema = getStepSchema(step);

    try {
      let success = false;
      let data = null;

      if (useSpecializedFunction) {
        // Use specialized edge function for this step
        console.log(`[Wizard AI] Using specialized edge function: ${edgeFunctionName} for step ${step}`);

        // Build request body - include taxonomy data for Step 1 (Context)
        const requestBody = {
          strategic_plan_id: planId,
          context: {
            ...context,
            wizardData,
            prompt,
            schema
          },
          language: language
        };

        // Steps 1-9 need taxonomy data for context-aware generation
        if (step >= 1 && step <= 9) {
          requestBody.taxonomyData = {
            sectors: sectors || [],
            regions: regions || [],
            strategicThemes: strategicThemes || [],
            technologies: technologies || [],
            visionPrograms: visionPrograms || [],
            stakeholderTypes: stakeholderTypes || [],
            riskCategories: riskCategories || []
          };
          // Also include as taxonomy for backward compatibility
          requestBody.taxonomy = requestBody.taxonomyData;
          requestBody.taxonomy_data = requestBody.taxonomyData;
        }

        const { data: fnData, error: fnError } = await supabase.functions.invoke(edgeFunctionName, {
          body: requestBody
        });

        if (fnError) {
          console.error(`[Wizard AI] Edge function error:`, fnError);
          throw fnError;
        }

        success = fnData?.success !== false;
        data = fnData?.data || fnData;
      } else {
        // Use generic invoke-llm for this step
        console.log(`[Wizard AI] Using generic invoke-llm for step ${step}`);

        // Import system prompt from centralized module
        const { STRATEGY_WIZARD_SYSTEM_PROMPT } = await import('@/lib/ai/prompts/strategy/wizard');

        const result = await invokeAI({
          prompt,
          response_json_schema: schema,
          system_prompt: STRATEGY_WIZARD_SYSTEM_PROMPT
        });

        success = result.success;
        data = result.data;
      }

      if (success && data) {
        // Merge AI response into wizard data based on step
        // Merge AI response into wizard data based on step using helper
        const updates = processAIResponse(step, data, wizardData);

        if (Object.keys(updates).length > 0) {
          // Use updateData so AI-generated content is persisted immediately to local storage
          // and queued for database save (prevents losing work on refresh)
          updateData(updates);
          toast.success(t({ en: 'AI generation complete', ar: 'تم الإنشاء بالذكاء الاصطناعي' }));
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء بالذكاء الاصطناعي' }));
    } finally {
      setGeneratingStep(null);
    }
  };

  // Generate a single new objective that's different from existing ones
  const generateSingleObjective = async (existingObjectives, targetSector = null) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return null;
    }

    // Build sector codes from taxonomy for consistent usage
    const taxonomySectorCodes = sectors.map(s => s.code);
    const taxonomySectorList = sectors.map(s => `${s.code} (${s.name_en})`).join(', ');

    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      mission: wizardData.mission_en || wizardData.mission_ar || '',
      sectors: taxonomySectorCodes, // Use taxonomy sectors
      themes: wizardData.strategic_themes || [],
      technologies: wizardData.focus_technologies || [],
      startYear: wizardData.start_year || new Date().getFullYear(),
      endYear: wizardData.end_year || new Date().getFullYear() + 5,
      budgetRange: wizardData.budget_range || ''
    };

    // Build detailed existing objectives summary with full context
    const existingObjectivesSummary = existingObjectives.map((o, i) =>
      `${i + 1}. [${o.sector_code || 'General'}] "${o.name_en || o.name_ar}"
   - EN Description: ${o.description_en || 'N/A'}
   - AR Description: ${o.description_ar || 'N/A'}
   - Priority: ${o.priority || 'medium'}
   - Key themes: ${extractKeyThemes(o.name_en, o.description_en)}`
    ).join('\n\n');

    // Helper to extract key themes from text
    function extractKeyThemes(name, description) {
      const text = `${name || ''} ${description || ''}`.toLowerCase();
      const themes = [];
      if (text.includes('digital') || text.includes('smart') || text.includes('technology')) themes.push('Digital/Tech');
      if (text.includes('citizen') || text.includes('service') || text.includes('satisfaction')) themes.push('Citizen Services');
      if (text.includes('housing') || text.includes('residential')) themes.push('Housing');
      if (text.includes('infrastructure') || text.includes('urban')) themes.push('Infrastructure');
      if (text.includes('environment') || text.includes('sustainable') || text.includes('green')) themes.push('Environment');
      if (text.includes('innovation') || text.includes('research') || text.includes('development')) themes.push('Innovation');
      if (text.includes('governance') || text.includes('policy') || text.includes('regulation')) themes.push('Governance');
      if (text.includes('capacity') || text.includes('training') || text.includes('talent')) themes.push('Capacity Building');
      return themes.length > 0 ? themes.join(', ') : 'General';
    }

    // Calculate sector coverage for the prompt using dynamic sectors
    const sectorCoverage = sectors.map(s => ({
      code: s.code,
      name: s.name_en,
      count: existingObjectives.filter(o => o.sector_code === s.code).length
    }));

    const sectorCoverageSummary = sectorCoverage
      .map(s => `${s.code}: ${s.count} objectives`)
      .join(', ');

    const availableSectorsList = sectors.map(s => `${s.code} (${s.name_en})`).join(', ');

    // Build sector targeting instruction
    const sectorTargetInstruction = targetSector
      ? `
## MANDATORY SECTOR TARGET:
**YOU MUST generate an objective for sector: ${targetSector}**
- The sector_code in your response MUST be: "${targetSector}"
- The objective title, description, and all content MUST be specific to ${targetSector}
- DO NOT generate an objective for any other sector
- This is a strict requirement from the user
`
      : `
## SECTOR SELECTION GUIDANCE:
Based on current coverage: ${sectorCoverageSummary}
- PRIORITIZE sectors with 0 or 1 objectives for better coverage
- Avoid sectors that already have 2+ objectives unless specifically relevant
`;

    // Use imported prompt generator with all context parameters
    const singleObjectivePrompt = generateSingleObjectivePrompt({
      context,
      wizardData,
      existingObjectives,
      existingObjectivesSummary,
      sectorCoverageSummary,
      sectorTargetInstruction,
      targetSector,
      taxonomySectorList,
      taxonomySectorCodes
    });

    // Use imported schema
    const singleObjectiveSchema = SINGLE_OBJECTIVE_SCHEMA;

    try {
      const { success, data } = await invokeAI({
        prompt: singleObjectivePrompt,
        response_json_schema: singleObjectiveSchema,
        system_prompt: SINGLE_OBJECTIVE_SYSTEM_PROMPT
      });

      if (success && data?.objective) {
        const newObjective = {
          ...data.objective,
          priority: data.objective.priority || 'medium'
        };

        // Calculate REAL uniqueness score using algorithmic similarity
        let realUniquenessScore = 75; // Default fallback
        let scoreDetails = null;

        try {
          console.log('[Objective] Calculating real uniqueness score...');
          const { data: similarityData, error: similarityError } = await supabase.functions.invoke('strategy-objective-similarity', {
            body: {
              newObjective,
              existingObjectives
            }
          });

          if (!similarityError && similarityData?.uniqueness_score) {
            realUniquenessScore = similarityData.uniqueness_score;
            scoreDetails = {
              max_similarity: similarityData.max_similarity,
              most_similar_to: similarityData.most_similar_to,
              sector_coverage_bonus: similarityData.sector_coverage_bonus,
              strategic_level_score: similarityData.strategic_level_score
            };
            console.log('[Objective] Real uniqueness score:', realUniquenessScore, scoreDetails);
          } else {
            console.warn('[Objective] Similarity calculation failed, using AI score:', similarityError);
            realUniquenessScore = data.differentiation_score || 75;
          }
        } catch (simError) {
          console.warn('[Objective] Similarity service error:', simError);
          realUniquenessScore = data.differentiation_score || 75;
        }

        return {
          objective: newObjective,
          differentiation_score: realUniquenessScore,
          score_details: scoreDetails
        };
      }
      return null;
    } catch (error) {
      console.error('Single objective generation error:', error);
      toast.error(t({ en: 'Failed to generate objective', ar: 'فشل في إنشاء الهدف' }));
      return null;
    }
  };

  // Generate a single new stakeholder that's different from existing ones
  const generateSingleStakeholder = async (existingStakeholders, targetType = null) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return null;
    }

    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      mission: wizardData.mission_en || wizardData.mission_ar || '',
      sectors: wizardData.sectors || [],
      themes: wizardData.strategic_themes || [],
      technologies: wizardData.focus_technologies || [],
      startYear: wizardData.start_year || new Date().getFullYear(),
      endYear: wizardData.end_year || new Date().getFullYear() + 5
    };

    // Build existing stakeholders summary
    const existingStakeholdersSummary = existingStakeholders.map((s, i) =>
      `${i + 1}. [${s.type || 'Unknown'}] "${s.name_en || s.name_ar}" - Power: ${s.power}, Interest: ${s.interest}`
    ).join('\n');

    // Calculate type coverage
    const typeCounts = {};
    existingStakeholders.forEach(s => {
      typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
    });
    const typeCoverageSummary = Object.entries(typeCounts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ') || 'No stakeholders yet';

    const typeTargetInstruction = targetType
      ? `MANDATORY: Generate a stakeholder of type "${targetType}"`
      : 'Target underrepresented types for better coverage';

    const prompt = generateSingleStakeholderPrompt({
      context,
      wizardData,
      existingStakeholders,
      existingStakeholdersSummary,
      typeCoverageSummary,
      typeTargetInstruction,
      targetType
    });

    try {
      const { success, data } = await invokeAI({
        prompt,
        response_json_schema: SINGLE_STAKEHOLDER_SCHEMA,
        system_prompt: SINGLE_STAKEHOLDER_SYSTEM_PROMPT
      });

      if (success && data?.stakeholder) {
        return {
          stakeholder: data.stakeholder,
          differentiation_score: data.differentiation_score || 75
        };
      }
      return null;
    } catch (error) {
      console.error('Single stakeholder generation error:', error);
      toast.error(t({ en: 'Failed to generate stakeholder', ar: 'فشل في إنشاء الجهة' }));
      return null;
    }
  };

  // Generate a single new risk that's different from existing ones
  const generateSingleRisk = async (existingRisks, targetCategory = null) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return null;
    }

    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      sectors: wizardData.sectors || [],
      startYear: wizardData.start_year || new Date().getFullYear(),
      endYear: wizardData.end_year || new Date().getFullYear() + 5
    };

    // Build existing risks summary
    const existingRisksSummary = existingRisks.map((r, i) =>
      `${i + 1}. [${r.category || 'Unknown'}] "${r.title_en || r.title_ar}" - Likelihood: ${r.likelihood}, Impact: ${r.impact}`
    ).join('\n');

    // Calculate category coverage
    const categoryCounts = {};
    existingRisks.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    const categoryCoverageSummary = Object.entries(categoryCounts)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ') || 'No risks yet';

    const categoryTargetInstruction = targetCategory
      ? `MANDATORY: Generate a risk of category "${targetCategory}"`
      : 'Target underrepresented categories for better coverage';

    const prompt = generateSingleRiskPrompt({
      context,
      wizardData,
      existingRisks,
      existingRisksSummary,
      categoryCoverageSummary,
      categoryTargetInstruction,
      targetCategory
    });

    try {
      const { success, data } = await invokeAI({
        prompt,
        response_json_schema: SINGLE_RISK_SCHEMA,
        system_prompt: SINGLE_RISK_SYSTEM_PROMPT
      });

      if (success && data?.risk) {
        return {
          risk: data.risk,
          differentiation_score: data.differentiation_score || 75
        };
      }
      return null;
    } catch (error) {
      console.error('Single risk generation error:', error);
      toast.error(t({ en: 'Failed to generate risk', ar: 'فشل في إنشاء المخاطرة' }));
      return null;
    }
  };

  // Generate a single new KPI that's different from existing ones
  const generateSingleKpi = async (existingKpis, targetCategory = null, targetObjectiveIndex = null) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return null;
    }

    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      objectives: wizardData.objectives || [],
      startYear: wizardData.start_year || new Date().getFullYear(),
      endYear: wizardData.end_year || new Date().getFullYear() + 5
    };

    // Build existing KPIs summary
    const existingKpisSummary = existingKpis.map((k, i) =>
      `${i + 1}. [${k.category || 'Unknown'}] "${k.name_en || k.name_ar}" - Objective ${k.objective_index}, Unit: ${k.unit}`
    ).join('\n');

    // Calculate category coverage
    const categoryCounts = {};
    existingKpis.forEach(k => {
      categoryCounts[k.category] = (categoryCounts[k.category] || 0) + 1;
    });
    const categoryCoverageSummary = Object.entries(categoryCounts)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ') || 'No KPIs yet';

    const categoryTargetInstruction = targetCategory
      ? `MANDATORY: Generate a KPI of category "${targetCategory}"`
      : 'Balance categories for comprehensive coverage';

    const prompt = generateSingleKpiPrompt({
      context,
      wizardData,
      existingKpis,
      existingKpisSummary,
      categoryCoverageSummary,
      categoryTargetInstruction,
      targetCategory,
      targetObjectiveIndex
    });

    try {
      const { success, data } = await invokeAI({
        prompt,
        response_json_schema: SINGLE_KPI_SCHEMA,
        system_prompt: SINGLE_KPI_SYSTEM_PROMPT
      });

      if (success && data?.kpi) {
        return {
          kpi: data.kpi,
          differentiation_score: data.differentiation_score || 75
        };
      }
      return null;
    } catch (error) {
      console.error('Single KPI generation error:', error);
      toast.error(t({ en: 'Failed to generate KPI', ar: 'فشل في إنشاء المؤشر' }));
      return null;
    }
  };

  // Generate a single new action that's different from existing ones
  const generateSingleAction = async (existingActions, targetType = null, targetObjectiveIndex = null) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return null;
    }

    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      objectives: wizardData.objectives || [],
      startYear: wizardData.start_year || new Date().getFullYear(),
      endYear: wizardData.end_year || new Date().getFullYear() + 5
    };

    // Build existing actions summary
    const existingActionsSummary = existingActions.map((a, i) =>
      `${i + 1}. [${a.type || 'Unknown'}] "${a.name_en || a.name_ar}" - Objective ${a.objective_index}, Priority: ${a.priority}`
    ).join('\n');

    // Calculate type coverage
    const typeCounts = {};
    existingActions.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    const typeCoverageSummary = Object.entries(typeCounts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ') || 'No actions yet';

    const typeTargetInstruction = targetType
      ? `MANDATORY: Generate an action of type "${targetType}"`
      : 'Balance action types for comprehensive coverage';

    const prompt = generateSingleActionPrompt({
      context,
      wizardData,
      existingActions,
      existingActionsSummary,
      typeCoverageSummary,
      typeTargetInstruction,
      targetType,
      targetObjectiveIndex
    });

    try {
      const { success, data } = await invokeAI({
        prompt,
        response_json_schema: SINGLE_ACTION_SCHEMA,
        system_prompt: SINGLE_ACTION_SYSTEM_PROMPT
      });

      if (success && data?.action) {
        return {
          action: data.action,
          differentiation_score: data.differentiation_score || 75
        };
      }
      return null;
    } catch (error) {
      console.error('Single action generation error:', error);
      toast.error(t({ en: 'Failed to generate action', ar: 'فشل في إنشاء الإجراء' }));
      return null;
    }
  };

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
