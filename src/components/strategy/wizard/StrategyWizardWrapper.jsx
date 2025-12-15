import React, { useState, useEffect, useCallback } from 'react';
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
import { useStrategyTemplates } from '@/hooks/strategy/useStrategyTemplates';
import { useWizardValidation } from '@/hooks/strategy/useWizardValidation';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

import { WIZARD_STEPS, initialWizardData } from './StrategyWizardSteps';
import WizardStepIndicator from './WizardStepIndicator';
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
import { Step16Communication, Step17Change } from './steps/Step16Communication';
import Step18Review from './steps/Step8Review';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { createApprovalRequest } = useApprovalRequest();
  const { applyTemplate } = useStrategyTemplates();
  
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

  // Auto-save hook
  const {
    scheduleAutoSave,
    saveNow,
    loadLocalDraft,
    clearLocalDraft,
    loadPlan,
    hasDraft,
    lastSaved,
    isSaving
  } = useAutoSaveDraft({ planId, mode, enabled: mode !== 'review' });

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

  // AI generation for each step
  const generateForStep = async (step) => {
    if (!aiAvailable) {
      toast.error(t({ en: 'AI not available', ar: 'الذكاء الاصطناعي غير متاح' }));
      return;
    }
    
    setGeneratingStep(step);
    
    const stepConfig = WIZARD_STEPS.find(s => s.num === step);
    const stepKey = stepConfig?.key || '';
    
    // Build context from existing data
    const context = {
      planName: wizardData.name_en || wizardData.name_ar || 'Strategic Plan',
      vision: wizardData.vision_en || wizardData.vision_ar || '',
      mission: wizardData.mission_en || wizardData.mission_ar || '',
      sectors: wizardData.target_sectors || [],
      themes: wizardData.strategic_themes || [],
      objectives: wizardData.objectives || []
    };
    
    const prompts = {
      context: `Generate context and discovery content for this Saudi municipal strategic plan:
Plan Name: ${context.planName}
Sectors: ${context.sectors.join(', ')}
Themes: ${context.themes.join(', ')}

Generate vision statement, mission statement, and description in both English and Arabic.`,
      vision: `Generate vision and mission statements for a Saudi municipal strategic plan.
Plan: ${context.planName}
Sectors: ${context.sectors.join(', ')}
Themes: ${context.themes.join(', ')}

Provide in both English and Arabic.`,
      stakeholders: `Identify key stakeholders for this Saudi municipal strategic plan:
Plan: ${context.planName}
Vision: ${context.vision}
Sectors: ${context.sectors.join(', ')}

List stakeholders with their power level (high/medium/low) and interest level.`,
      pestel: `Conduct PESTEL analysis for this Saudi municipal strategy:
Plan: ${context.planName}
Vision: ${context.vision}
Sectors: ${context.sectors.join(', ')}

Analyze Political, Economic, Social, Technological, Environmental, and Legal factors relevant to Saudi Arabia and Vision 2030.`,
      swot: `Conduct SWOT analysis for this Saudi municipal strategic plan:
Plan: ${context.planName}
Vision: ${context.vision}
Sectors: ${context.sectors.join(', ')}

Identify Strengths, Weaknesses, Opportunities, and Threats.`,
      scenarios: `Create scenario planning for this Saudi strategic plan:
Plan: ${context.planName}
Vision: ${context.vision}

Provide Best Case, Worst Case, and Most Likely scenarios with assumptions and outcomes.`,
      risks: `Identify risks for this Saudi municipal strategic plan:
Plan: ${context.planName}
Vision: ${context.vision}
Sectors: ${context.sectors.join(', ')}

Return 8-12 risks. Use category codes from: STRATEGIC, OPERATIONAL, FINANCIAL, REGULATORY, TECHNOLOGY, REPUTATIONAL, POLITICAL, ENVIRONMENTAL.
Use likelihood and impact as: low | medium | high.
Include: title, description, mitigation_strategy, contingency_plan, owner (role or department).`,
      kpis: `Generate KPIs for this Saudi strategic plan:
Plan: ${context.planName}
Objectives: ${context.objectives.map(o => o.name_en || o.name_ar).join(', ')}

Return 2-4 KPIs per objective.
Include: name_en, name_ar, unit, baseline_value, target_value, objective_index, frequency (monthly|quarterly|annual), data_source, owner.`,
      actions: `Generate action plans for this Saudi municipal strategy:
Plan: ${context.planName}
Objectives: ${context.objectives.map(o => o.name_en || o.name_ar).join(', ')}

Return 2-4 action plans per objective.
Include: name_en, name_ar, description_en, description_ar, objective_index, type (initiative|program|project|pilot), priority (high|medium|low), budget_estimate (SAR), owner, deliverables (array of strings), dependencies (array of strings).`,
      resources: `Generate resource plan for this Saudi municipal strategy:
Plan: ${context.planName}
Duration: ${wizardData.start_year}-${wizardData.end_year}
Objectives: ${context.objectives.map(o => o.name_en).join(', ')}

Identify HR, technology, infrastructure requirements and budget allocation.`,
      timeline: `Generate implementation timeline for this Saudi strategic plan:
Plan: ${context.planName}
Duration: ${wizardData.start_year}-${wizardData.end_year}
Objectives count: ${context.objectives.length}

Create phases and milestones for implementation.`,
      governance: `Generate governance structure for this Saudi municipal strategic plan:
Plan: ${context.planName}
Vision: ${context.vision}

Define committees, roles, reporting frequency, and escalation paths.`,
      communication: `Generate communication plan for this Saudi municipal strategy:
Plan: ${context.planName}
Vision: ${context.vision}
Stakeholders count: ${(wizardData.stakeholders || []).length}

Define key messages, internal channels, and external channels.`,
      change: `Generate change management plan for this Saudi municipal strategy:
Plan: ${context.planName}
Vision: ${context.vision}

Assess readiness, define change approach, and resistance management strategies.`
    };
    
    const schemas = {
      context: {
        type: 'object',
        properties: {
          vision_en: { type: 'string' },
          vision_ar: { type: 'string' },
          mission_en: { type: 'string' },
          mission_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      },
      vision: {
        type: 'object',
        properties: {
          vision_en: { type: 'string' },
          vision_ar: { type: 'string' },
          mission_en: { type: 'string' },
          mission_ar: { type: 'string' },
          core_values: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' } } } }
        }
      },
      stakeholders: {
        type: 'object',
        properties: {
          stakeholders: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' }, power: { type: 'string' }, interest: { type: 'string' }, engagement_level: { type: 'string' }, influence_strategy: { type: 'string' } } } }
        }
      },
      pestel: {
        type: 'object',
        properties: {
          political: { type: 'array', items: { type: 'string' } },
          economic: { type: 'array', items: { type: 'string' } },
          social: { type: 'array', items: { type: 'string' } },
          technological: { type: 'array', items: { type: 'string' } },
          environmental: { type: 'array', items: { type: 'string' } },
          legal: { type: 'array', items: { type: 'string' } }
        }
      },
      swot: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          threats: { type: 'array', items: { type: 'string' } }
        }
      },
      scenarios: {
        type: 'object',
        properties: {
          best_case: { type: 'object', properties: { description: { type: 'string' }, assumptions: { type: 'array', items: { type: 'string' } }, outcomes: { type: 'array', items: { type: 'string' } } } },
          worst_case: { type: 'object', properties: { description: { type: 'string' }, assumptions: { type: 'array', items: { type: 'string' } }, outcomes: { type: 'array', items: { type: 'string' } } } },
          most_likely: { type: 'object', properties: { description: { type: 'string' }, assumptions: { type: 'array', items: { type: 'string' } }, outcomes: { type: 'array', items: { type: 'string' } } } }
        }
      },
      risks: {
        type: 'object',
        properties: {
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                likelihood: { type: 'string' },
                impact: { type: 'string' },
                mitigation_strategy: { type: 'string' },
                contingency_plan: { type: 'string' },
                owner: { type: 'string' }
              }
            }
          }
        }
      },
      dependencies: {
        type: 'object',
        properties: {
          dependencies: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' }, source: { type: 'string' }, target: { type: 'string' }, criticality: { type: 'string' } } } },
          constraints: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, type: { type: 'string' }, impact: { type: 'string' }, mitigation: { type: 'string' } } } },
          assumptions: { type: 'array', items: { type: 'object', properties: { statement: { type: 'string' }, category: { type: 'string' }, confidence: { type: 'string' } } } }
        }
      },
      objectives: {
        type: 'object',
        properties: {
          objectives: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' }, sector_code: { type: 'string' }, priority: { type: 'string' } } } }
        }
      },
      national: {
        type: 'object',
        properties: {
          alignments: { type: 'array', items: { type: 'object', properties: { objective_index: { type: 'number' }, goal_code: { type: 'string' }, target_code: { type: 'string' } } } }
        }
      },
      kpis: {
        type: 'object',
        properties: {
          kpis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                unit: { type: 'string' },
                baseline_value: { type: 'string' },
                target_value: { type: 'string' },
                objective_index: { type: 'number' },
                frequency: { type: 'string' },
                data_source: { type: 'string' },
                owner: { type: 'string' }
              }
            }
          }
        }
      },
      actions: {
        type: 'object',
        properties: {
          action_plans: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                objective_index: { type: 'number' },
                type: { type: 'string' },
                priority: { type: 'string' },
                budget_estimate: { type: 'string' },
                owner: { type: 'string' },
                deliverables: { type: 'array', items: { type: 'string' } },
                dependencies: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      resources: {
        type: 'object',
        properties: {
          hr_requirements: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' } } } },
          technology_requirements: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' } } } },
          infrastructure_requirements: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' } } } },
          budget_allocation: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' } } } }
        }
      },
      timeline: {
        type: 'object',
        properties: {
          phases: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, start_date: { type: 'string' }, end_date: { type: 'string' }, description: { type: 'string' } } } },
          milestones: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, date: { type: 'string' }, type: { type: 'string' } } } }
        }
      },
      governance: {
        type: 'object',
        properties: {
          committees: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, meeting_frequency: { type: 'string' }, responsibilities: { type: 'string' } } } },
          reporting_frequency: { type: 'string' }
        }
      },
      communication: {
        type: 'object',
        properties: {
          key_messages: { type: 'array', items: { type: 'string' } },
          internal_channels: { type: 'array', items: { type: 'string' } },
          external_channels: { type: 'array', items: { type: 'string' } }
        }
      },
      change: {
        type: 'object',
        properties: {
          readiness_assessment: { type: 'string' },
          change_approach: { type: 'string' },
          resistance_management: { type: 'string' }
        }
      }
    };
    
    const prompt = prompts[stepKey] || `Generate content for step "${stepConfig?.title?.en || stepKey}" of this Saudi municipal strategic plan: ${context.planName}`;
    const schema = schemas[stepKey];
    
    try {
      const { success, data } = await invokeAI({
        prompt,
        response_json_schema: schema,
        system_prompt: 'You are an expert in Saudi Arabian strategic planning and Vision 2030. Generate professional content in both English and Arabic. Use formal language appropriate for government documents.'
      });
      
      if (success && data) {
        // Merge AI response into wizard data based on step
        const updates = {};
        if (stepKey === 'context') {
          if (data.vision_en) updates.vision_en = data.vision_en;
          if (data.vision_ar) updates.vision_ar = data.vision_ar;
          if (data.mission_en) updates.mission_en = data.mission_en;
          if (data.mission_ar) updates.mission_ar = data.mission_ar;
          if (data.description_en) updates.description_en = data.description_en;
          if (data.description_ar) updates.description_ar = data.description_ar;
        } else if (stepKey === 'vision') {
          if (data.vision_en) updates.vision_en = data.vision_en;
          if (data.vision_ar) updates.vision_ar = data.vision_ar;
          if (data.mission_en) updates.mission_en = data.mission_en;
          if (data.mission_ar) updates.mission_ar = data.mission_ar;
          if (data.core_values) updates.core_values = data.core_values.map((v, i) => ({ ...v, id: Date.now().toString() + i }));
        } else if (stepKey === 'stakeholders' && data.stakeholders) {
          updates.stakeholders = data.stakeholders.map((s, i) => ({ 
            ...s, 
            id: Date.now().toString() + i,
            type: s.type || 'GOVERNMENT',
            engagement_level: s.engagement_level || 'consult'
          }));
        } else if (stepKey === 'pestel') {
          updates.pestel = {
            political: data.political || [],
            economic: data.economic || [],
            social: data.social || [],
            technological: data.technological || [],
            environmental: data.environmental || [],
            legal: data.legal || []
          };
        } else if (stepKey === 'swot') {
          updates.swot = {
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            opportunities: data.opportunities || [],
            threats: data.threats || []
          };
        } else if (stepKey === 'scenarios') {
          updates.scenarios = {
            best_case: data.best_case || { description: '', assumptions: [], outcomes: [] },
            worst_case: data.worst_case || { description: '', assumptions: [], outcomes: [] },
            most_likely: data.most_likely || { description: '', assumptions: [], outcomes: [] }
          };
        } else if (stepKey === 'risks' && data.risks) {
          const scoreMap = { low: 1, medium: 2, high: 3 };
          updates.risks = data.risks.map((r, i) => {
            const likelihood = r.likelihood || 'medium';
            const impact = r.impact || 'medium';
            return {
              id: Date.now().toString() + i,
              title: r.title || '',
              description: r.description || '',
              category: r.category || 'OPERATIONAL',
              likelihood,
              impact,
              risk_score: (scoreMap[likelihood] || 0) * (scoreMap[impact] || 0),
              mitigation_strategy: r.mitigation_strategy || r.mitigation || '',
              contingency_plan: r.contingency_plan || '',
              owner: r.owner || '',
              status: 'identified'
            };
          });
        } else if (stepKey === 'dependencies') {
          if (data.dependencies) {
            updates.dependencies = data.dependencies.map((d, i) => ({ 
              ...d, 
              id: Date.now().toString() + i,
              status: 'pending'
            }));
          }
          if (data.constraints) {
            updates.constraints = data.constraints.map((c, i) => ({ ...c, id: Date.now().toString() + i }));
          }
          if (data.assumptions) {
            updates.assumptions = data.assumptions.map((a, i) => ({ ...a, id: Date.now().toString() + i }));
          }
        } else if (stepKey === 'objectives' && data.objectives) {
          updates.objectives = data.objectives.map((o, i) => ({ 
            ...o, 
            priority: o.priority || 'medium',
            target_year: wizardData.end_year
          }));
        } else if (stepKey === 'national' && data.alignments) {
          updates.national_alignments = data.alignments.map(a => ({
            key: `${a.objective_index}-${a.goal_code}${a.target_code ? `-${a.target_code}` : ''}`,
            objective_index: a.objective_index,
            goal_code: a.goal_code,
            target_code: a.target_code
          }));
        } else if (stepKey === 'kpis' && data.kpis) {
          updates.kpis = data.kpis.map((k, i) => ({
            id: Date.now().toString() + i,
            name_en: k.name_en || '',
            name_ar: k.name_ar || '',
            objective_index: typeof k.objective_index === 'number' ? k.objective_index : null,
            unit: k.unit || '',
            baseline_value: String(k.baseline_value ?? k.baseline ?? ''),
            target_value: String(k.target_value ?? k.target ?? ''),
            target_year: wizardData.end_year,
            frequency: k.frequency || 'quarterly',
            data_source: k.data_source || '',
            owner: k.owner || ''
          }));
        } else if (stepKey === 'actions' && data.action_plans) {
          updates.action_plans = data.action_plans.map((a, i) => ({ 
            id: Date.now().toString() + i,
            name_en: a.name_en || '',
            name_ar: a.name_ar || '',
            description_en: a.description_en || '',
            description_ar: a.description_ar || '',
            objective_index: typeof a.objective_index === 'number' ? a.objective_index : null,
            type: a.type || 'initiative',
            priority: a.priority || 'medium',
            budget_estimate: a.budget_estimate || '',
            owner: a.owner || '',
            deliverables: Array.isArray(a.deliverables) ? a.deliverables : [],
            dependencies: Array.isArray(a.dependencies) ? a.dependencies : []
          }));
        } else if (stepKey === 'resources') {
          updates.resource_plan = {
            hr_requirements: (data.hr_requirements || []).map((r, i) => ({ ...r, id: Date.now().toString() + 'hr' + i })),
            technology_requirements: (data.technology_requirements || []).map((r, i) => ({ ...r, id: Date.now().toString() + 'tech' + i })),
            infrastructure_requirements: (data.infrastructure_requirements || []).map((r, i) => ({ ...r, id: Date.now().toString() + 'infra' + i })),
            budget_allocation: (data.budget_allocation || []).map((r, i) => ({ ...r, id: Date.now().toString() + 'budget' + i }))
          };
        } else if (stepKey === 'timeline') {
          if (data.phases) {
            updates.phases = data.phases.map((p, i) => ({ ...p, id: Date.now().toString() + 'phase' + i }));
          }
          if (data.milestones) {
            updates.milestones = data.milestones.map((m, i) => ({ 
              ...m, 
              id: Date.now().toString() + 'ms' + i,
              status: 'planned'
            }));
          }
        } else if (stepKey === 'governance') {
          updates.governance = {
            ...wizardData.governance,
            committees: (data.committees || []).map((c, i) => ({ ...c, id: Date.now().toString() + i })),
            reporting_frequency: data.reporting_frequency || 'monthly'
          };
        } else if (stepKey === 'communication') {
          updates.communication_plan = {
            ...wizardData.communication_plan,
            key_messages: data.key_messages || [],
            internal_channels: data.internal_channels || [],
            external_channels: data.external_channels || []
          };
        } else if (stepKey === 'change') {
          updates.change_management = {
            ...wizardData.change_management,
            readiness_assessment: data.readiness_assessment || '',
            change_approach: data.change_approach || '',
            resistance_management: data.resistance_management || ''
          };
        }
        
        if (Object.keys(updates).length > 0) {
          setWizardData(prev => ({ ...prev, ...updates }));
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

  const handleNext = () => {
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
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
      setWizardData({ ...initialWizardData, ...draft });
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
      onChange: isReadOnly ? () => {} : updateData, 
      onGenerateAI: () => generateForStep(currentStep), 
      isGenerating,
      isReadOnly
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
      case 12: return <Step12Actions {...props} />;
      case 13: return <Step13Resources {...props} />;
      case 14: return <Step14Timeline {...props} />;
      case 15: return <Step15Governance {...props} />;
      case 16: return <Step16Communication {...props} />;
      case 17: return <Step17Change {...props} />;
      case 18: return (
        <Step18Review 
          data={wizardData} 
          onSave={() => saveMutation.mutate(wizardData)} 
          onSubmitForApproval={() => submitMutation.mutate(wizardData)}
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
        onStepClick={setCurrentStep} 
        completedSteps={completedSteps} 
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
              onClick={() => saveNow(wizardData, currentStep)}
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
    </div>
  );
}
