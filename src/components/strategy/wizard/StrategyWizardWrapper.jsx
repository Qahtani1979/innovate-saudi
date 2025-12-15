import React from 'react';
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

  // Apply template without react-query hooks (prevents "dispatcher is null" hook crashes)
  const applyTemplate = React.useCallback(async (templateId) => {
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
  const [mode, setMode] = React.useState('create'); // 'create' | 'edit' | 'review'
  const [planId, setPlanId] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [wizardData, setWizardData] = React.useState(initialWizardData);
  const [generatingStep, setGeneratingStep] = React.useState(null);
  const [completedSteps, setCompletedSteps] = React.useState([]);
  const [showDraftRecovery, setShowDraftRecovery] = React.useState(false);
  const [appliedTemplateName, setAppliedTemplateName] = React.useState(null);

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
  React.useEffect(() => {
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
  const updateData = React.useCallback((updates) => {
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
    
    const prompts = {
      context: `Generate comprehensive context and discovery content for this Saudi municipal strategic plan:
Plan Name (English): ${context.planName}

Based on the plan name, suggest appropriate values for ALL of the following:

1. ARABIC TITLE:
- name_ar: Arabic translation of the plan title

2. VISION & MISSION (in both English and Arabic):
- vision_en, vision_ar
- mission_en, mission_ar
- description_en, description_ar

3. DURATION & RESOURCES:
- start_year: Suggested start year (2024-2027)
- end_year: Suggested end year (2027-2035)
- budget_range: One of: "<10M", "10-50M", "50-100M", "100-500M", ">500M"

4. TARGET SECTORS (select relevant codes from: URBAN_PLANNING, HOUSING, INFRASTRUCTURE, ENVIRONMENT, SMART_CITIES, DIGITAL_SERVICES, CITIZEN_SERVICES, RURAL_DEVELOPMENT, PUBLIC_SPACES, WATER_RESOURCES, TRANSPORTATION, HERITAGE):
- target_sectors: Array of sector codes

5. STRATEGIC THEMES (select relevant codes from: DIGITAL_TRANSFORMATION, SUSTAINABILITY, CITIZEN_EXPERIENCE, INNOVATION, GOVERNANCE, ECONOMIC_ENABLEMENT, QUALITY_OF_LIFE, OPERATIONAL_EXCELLENCE):
- strategic_themes: Array of theme codes

6. FOCUS TECHNOLOGIES (select relevant codes from: AI_ML, IOT, BLOCKCHAIN, DIGITAL_TWINS, DRONES, 5G_6G, ROBOTICS, AR_VR, BIM, CLEANTECH):
- focus_technologies: Array of technology codes

7. VISION 2030 PROGRAMS (select relevant codes from: QUALITY_OF_LIFE, HOUSING, NTP, THRIVING_CITIES, FISCAL_BALANCE, PRIVATIZATION, DARP):
- vision_2030_programs: Array of program codes

8. TARGET REGIONS (select relevant codes from: RIYADH, MAKKAH, MADINAH, EASTERN, ASIR, TABUK, HAIL, NORTHERN_BORDERS, JAZAN, NAJRAN, AL_BAHA, AL_JOUF, QASSIM, or leave empty for kingdom-wide):
- target_regions: Array of region codes

9. KEY STAKEHOLDERS (bilingual list):
- quick_stakeholders: Array of objects with name_en and name_ar for 6-10 key stakeholders

10. DISCOVERY INPUTS (all bilingual):
- key_challenges_en, key_challenges_ar
- available_resources_en, available_resources_ar
- initial_constraints_en, initial_constraints_ar

Use formal language appropriate for Saudi government documents.`,
      vision: `You are generating Core Values and Strategic Pillars for a Saudi municipal strategic plan. You MUST use ALL the context provided below to create highly relevant and specific outputs.

=== PLAN CONTEXT ===
Plan Name: ${context.planName}${context.planNameAr ? ` (${context.planNameAr})` : ''}
Vision Statement: ${context.vision || 'Not yet defined'}
Mission Statement: ${context.mission || 'Not yet defined'}
Description: ${context.description || 'Not yet defined'}

=== STRATEGIC FOCUS (CRITICAL - USE THESE) ===
Target Sectors: ${context.sectors.length > 0 ? context.sectors.join(', ') : 'General municipal services'}
Strategic Themes: ${context.themes.length > 0 ? context.themes.join(', ') : 'General improvement'}
Focus Technologies: ${context.technologies.length > 0 ? context.technologies.join(', ') : 'General technology adoption'}
Vision 2030 Programs: ${context.vision2030Programs.length > 0 ? context.vision2030Programs.join(', ') : 'General Vision 2030 alignment'}
Target Regions: ${context.regions.length > 0 ? context.regions.join(', ') : 'Kingdom-wide'}

=== DURATION & RESOURCES ===
Timeline: ${context.startYear} - ${context.endYear} (${context.endYear - context.startYear} years)
Budget Range: ${context.budgetRange || 'To be determined'}

=== KEY STAKEHOLDERS ===
${context.stakeholders.length > 0 ? context.stakeholders.map(s => `- ${s.name_en || s}${s.name_ar ? ` (${s.name_ar})` : ''}`).join('\n') : '- Municipal leadership and citizens'}

=== DISCOVERY INPUTS ===
Key Challenges: ${context.keyChallenges || 'General municipal challenges'}
Available Resources: ${context.availableResources || 'Standard municipal resources'}
Initial Constraints: ${context.initialConstraints || 'Standard constraints'}

=== GENERATION REQUIREMENTS ===

**1. CORE VALUES (Generate exactly 6-7 values)**
Each value MUST have: name_en, name_ar, description_en, description_ar

Requirements:
- Values MUST reflect Saudi government principles and Vision 2030
- At least 2 values should directly relate to the TARGET SECTORS specified
- At least 1 value should relate to the FOCUS TECHNOLOGIES
- Values should address the KEY CHALLENGES mentioned
- Each description should be 2-3 sentences explaining how this value guides the organization

**2. STRATEGIC PILLARS (Generate exactly 5-6 pillars)**
Each pillar MUST have: name_en, name_ar, description_en, description_ar

CRITICAL REQUIREMENTS:
- Each pillar MUST directly correspond to one or more TARGET SECTORS or STRATEGIC THEMES
- Pillars MUST explicitly incorporate the FOCUS TECHNOLOGIES where relevant
- Pillars MUST align with the specified VISION 2030 PROGRAMS
- Pillars should be designed to address the KEY CHALLENGES
- Pillars should be achievable within the BUDGET RANGE and TIMELINE
- Each description should be 3-4 sentences explaining:
  * What this pillar covers
  * Which sectors/technologies it addresses
  * Expected outcomes aligned with Vision 2030

Example pillar structure:
- If Target Sectors include "SMART_CITIES" and Focus Technologies include "IOT", create a pillar like "Smart City Infrastructure" that explicitly mentions IoT deployment
- If Vision 2030 Programs include "QUALITY_OF_LIFE", ensure a pillar addresses citizen well-being

Use formal Arabic (فصحى) for Arabic content. Be specific, not generic.`,
      stakeholders: `You are identifying key stakeholders for a Saudi municipal strategic plan. Use ALL context provided to generate comprehensive stakeholders AND a detailed engagement plan.

=== PLAN CONTEXT ===
Plan Name: ${context.planName}${context.planNameAr ? ` (${context.planNameAr})` : ''}
Vision: ${context.vision || 'Not yet defined'}
Mission: ${context.mission || 'Not yet defined'}

=== STRATEGIC FOCUS (USE TO IDENTIFY RELEVANT STAKEHOLDERS) ===
Target Sectors: ${context.sectors.length > 0 ? context.sectors.join(', ') : 'General municipal services'}
Strategic Themes: ${context.themes.length > 0 ? context.themes.join(', ') : 'General improvement'}
Focus Technologies: ${context.technologies.length > 0 ? context.technologies.join(', ') : 'General technology'}
Vision 2030 Programs: ${context.vision2030Programs.length > 0 ? context.vision2030Programs.join(', ') : 'General Vision 2030'}
Target Regions: ${context.regions.length > 0 ? context.regions.join(', ') : 'Kingdom-wide'}

=== DURATION & RESOURCES ===
Timeline: ${context.startYear} - ${context.endYear}
Budget Range: ${context.budgetRange || 'To be determined'}

=== EXISTING QUICK STAKEHOLDERS (expand on these) ===
${context.stakeholders.length > 0 ? context.stakeholders.map(s => `- ${s.name_en || s}${s.name_ar ? ` (${s.name_ar})` : ''}`).join('\n') : '- None specified yet'}

=== DISCOVERY INPUTS ===
Key Challenges: ${context.keyChallenges || 'General challenges'}
Available Resources: ${context.availableResources || 'Standard resources'}
Initial Constraints: ${context.initialConstraints || 'Standard constraints'}

=== GENERATION REQUIREMENTS ===

**PART 1: STAKEHOLDERS (Generate exactly 14-18 stakeholders)**

Each stakeholder MUST have ALL these fields (all text fields bilingual):
- name_en: Full organization/role name in English
- name_ar: Full organization/role name in Arabic  
- type: One of GOVERNMENT | PRIVATE | ACADEMIC | NGO | COMMUNITY | INTERNATIONAL | INTERNAL
- power: low | medium | high (influence over plan success)
- interest: low | medium | high (level of concern about outcomes)
- engagement_level: One of inform | consult | involve | collaborate | empower
- influence_strategy_en: 2-3 sentences on how to engage this stakeholder (English)
- influence_strategy_ar: 2-3 sentences on how to engage this stakeholder (Arabic)
- contact_person_en: Suggested role/title for primary contact in English (e.g., "Director of Strategic Planning")
- contact_person_ar: Suggested role/title for primary contact in Arabic (e.g., "مدير التخطيط الاستراتيجي")
- notes_en: Brief note about timing, special considerations, or relationship history (English)
- notes_ar: Brief note about timing, special considerations, or relationship history (Arabic)

CRITICAL DISTRIBUTION REQUIREMENTS:
- At least 4 GOVERNMENT stakeholders (relevant ministries, agencies)
- At least 3 PRIVATE sector stakeholders (technology vendors, contractors for focus technologies)
- At least 2 ACADEMIC/research institutions
- At least 2 COMMUNITY stakeholders (citizen groups, associations)
- At least 2 INTERNAL stakeholders (municipal departments)
- Include stakeholders from EACH target sector
- Include technology partners for EACH focus technology
- Include relevant Vision 2030 program offices

POWER/INTEREST DISTRIBUTION:
- 3-4 stakeholders with High Power + High Interest (Manage Closely)
- 3-4 stakeholders with High Power + Low/Medium Interest (Keep Satisfied)  
- 3-4 stakeholders with Low/Medium Power + High Interest (Keep Informed)
- 3-4 stakeholders with Low Power + Low Interest (Monitor)

**PART 2: STAKEHOLDER ENGAGEMENT PLAN (Required - Bilingual)**

Generate a comprehensive engagement plan in BOTH languages:
- stakeholder_engagement_plan_en: 3-5 paragraphs in English
- stakeholder_engagement_plan_ar: 3-5 paragraphs in Arabic (formal فصحى)

Both versions should describe:
1. Overall engagement philosophy and approach for this strategic plan
2. Communication cadence and channels for different stakeholder groups
3. Key engagement milestones aligned with the plan timeline (${context.startYear}-${context.endYear})
4. Mechanisms for stakeholder feedback and input
5. Risk mitigation for potential stakeholder resistance or disengagement

Be specific to the plan context, not generic.`,
      pestel: `Conduct a comprehensive PESTEL analysis for this Saudi municipal strategic plan:

**CONTEXT:**
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear}

**REQUIREMENTS:**
Generate factors for ALL 6 PESTEL categories. Each category MUST have 2-4 factors.

For EACH factor, provide ALL these fields in BOTH English and Arabic:
- factor_en: Factor name/description in English
- factor_ar: Factor name/description in Arabic (formal فصحى)
- impact: One of "low" | "medium" | "high"
- trend: One of "declining" | "stable" | "growing"
- timeframe: One of "short_term" | "medium_term" | "long_term"
- implications_en: Strategic implications in English (1-2 sentences)
- implications_ar: Strategic implications in Arabic (1-2 sentences)

**CATEGORY GUIDANCE FOR SAUDI CONTEXT:**
1. POLITICAL: Vision 2030 initiatives, municipal reforms, governance changes, decentralization
2. ECONOMIC: Oil diversification, PPP opportunities, economic zones, investment climate
3. SOCIAL: Youth demographics, urbanization, cultural shifts, women empowerment
4. TECHNOLOGICAL: Smart city tech, AI/digital transformation, 5G, e-government
5. ENVIRONMENTAL: Saudi Green Initiative, water scarcity, renewable energy, sustainability
6. LEGAL: Municipal law updates, data protection, labor reforms, compliance requirements

**DISTRIBUTION:**
- Mix of impacts: at least one high, one medium, one low per category where applicable
- Mix of trends: variety of declining, stable, growing
- Mix of timeframes: short, medium, and long term factors

Be specific to Saudi Arabia and the plan's sectors. Avoid generic statements.`,
      swot: `Conduct a comprehensive SWOT analysis for this Saudi municipal strategic plan:

**CONTEXT:**
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear}
- Stakeholder Count: ${(wizardData.stakeholders || []).length}

**REQUIREMENTS:**
Generate items for ALL 4 SWOT categories. Each category MUST have 4-6 items.

For EACH item, provide ALL these fields in BOTH English and Arabic:
- text_en: The SWOT item description in English (1-2 sentences)
- text_ar: The SWOT item description in Arabic (formal فصحى, 1-2 sentences)
- priority: One of "low" | "medium" | "high"

**CATEGORY GUIDANCE FOR SAUDI MUNICIPAL CONTEXT:**

1. STRENGTHS (Internal positive factors):
   - Government support and Vision 2030 alignment
   - Digital infrastructure readiness
   - Financial resources and funding access
   - Skilled workforce availability
   - Strategic location advantages
   - Existing partnerships and relationships

2. WEAKNESSES (Internal negative factors):
   - Capacity or skill gaps
   - Legacy systems or processes
   - Resource constraints
   - Coordination challenges between departments
   - Data management issues
   - Change resistance

3. OPPORTUNITIES (External positive factors):
   - Vision 2030 initiatives and funding programs
   - Digital transformation trends
   - International partnerships and knowledge transfer
   - Private sector investment interest
   - Demographic shifts (youth population)
   - Regional economic development

4. THREATS (External negative factors):
   - Economic volatility and oil dependency
   - Rapid technological change
   - Talent competition
   - Regulatory changes
   - Environmental challenges (water, climate)
   - Public expectation management

**DISTRIBUTION:**
- Each category should have a mix of priorities: at least one high, two medium, and one low
- Items should be specific to the plan's sectors, not generic
- Consider PESTEL factors when identifying opportunities and threats

Be specific to Saudi Arabia and the municipal context. Avoid vague or generic statements.`,
      scenarios: `Create comprehensive scenario planning for this Saudi municipal strategic plan:

**CONTEXT:**
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear}

**REQUIREMENTS:**
Generate ALL 3 scenarios: best_case, worst_case, and most_likely.

For EACH scenario, provide ALL these fields in BOTH English and Arabic:

1. **description_en / description_ar**: A 2-3 sentence narrative describing this scenario (what the future looks like)

2. **assumptions**: Array of 3-5 key assumptions. Each assumption must have:
   - text_en: Assumption in English
   - text_ar: Assumption in Arabic (formal فصحى)

3. **outcomes**: Array of 4-6 measurable outcomes. Each outcome must have:
   - metric_en: The metric/outcome name in English
   - metric_ar: The metric/outcome name in Arabic
   - value: The expected value/result (e.g., "95%", "+30%", "500,000 users")

4. **probability**: Likelihood percentage (e.g., "20%", "60%", "20%")

**SCENARIO GUIDANCE FOR SAUDI CONTEXT:**

BEST CASE (Optimistic - typically 15-25% probability):
- Vision 2030 goals exceeded
- Strong private sector investment
- Rapid digital adoption
- High citizen satisfaction
- Budget surplus and efficiency gains

WORST CASE (Pessimistic - typically 15-25% probability):
- Economic challenges (oil price volatility)
- Implementation delays
- Resource constraints
- Low stakeholder engagement
- Regulatory obstacles

MOST LIKELY (Realistic - typically 50-70% probability):
- Steady progress with some challenges
- Moderate achievement of targets
- Mixed stakeholder response
- Some budget adjustments needed
- Gradual capacity building

**DISTRIBUTION:**
- Probabilities should sum to 100%
- Each scenario should have distinct assumptions
- Outcomes should be measurable and specific to the plan's sectors
- Consider PESTEL and SWOT factors in scenario development

Be specific to Saudi Arabia and the plan context. Avoid generic outcomes.`,
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
        required: [
          'name_ar',
          'vision_en',
          'vision_ar',
          'mission_en',
          'mission_ar',
          'description_en',
          'description_ar',
          'start_year',
          'end_year',
          'budget_range',
          'target_sectors',
          'strategic_themes',
          'focus_technologies',
          'vision_2030_programs',
          'target_regions',
          'quick_stakeholders',
          'key_challenges_en',
          'key_challenges_ar',
          'available_resources_en',
          'available_resources_ar',
          'initial_constraints_en',
          'initial_constraints_ar'
        ],
        properties: {
          name_ar: { type: 'string' },
          vision_en: { type: 'string' },
          vision_ar: { type: 'string' },
          mission_en: { type: 'string' },
          mission_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          start_year: { type: 'integer' },
          end_year: { type: 'integer' },
          budget_range: { type: 'string' },
          target_sectors: { type: 'array', items: { type: 'string' } },
          strategic_themes: { type: 'array', items: { type: 'string' } },
          focus_technologies: { type: 'array', items: { type: 'string' } },
          vision_2030_programs: { type: 'array', items: { type: 'string' } },
          target_regions: { type: 'array', items: { type: 'string' } },
          quick_stakeholders: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                name_en: { type: 'string' }, 
                name_ar: { type: 'string' } 
              } 
            } 
          },
          key_challenges_en: { type: 'string' },
          key_challenges_ar: { type: 'string' },
          available_resources_en: { type: 'string' },
          available_resources_ar: { type: 'string' },
          initial_constraints_en: { type: 'string' },
          initial_constraints_ar: { type: 'string' }
        }
      },
      vision: {
        type: 'object',
        properties: {
          core_values: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                name_en: { type: 'string' }, 
                name_ar: { type: 'string' }, 
                description_en: { type: 'string' }, 
                description_ar: { type: 'string' } 
              } 
            } 
          },
          strategic_pillars: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                name_en: { type: 'string' }, 
                name_ar: { type: 'string' }, 
                description_en: { type: 'string' }, 
                description_ar: { type: 'string' } 
              } 
            } 
          }
        }
      },
      stakeholders: {
        type: 'object',
        properties: {
          stakeholders: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                name_en: { type: 'string' }, 
                name_ar: { type: 'string' }, 
                type: { type: 'string' }, 
                power: { type: 'string' }, 
                interest: { type: 'string' }, 
                engagement_level: { type: 'string' }, 
                influence_strategy_en: { type: 'string' },
                influence_strategy_ar: { type: 'string' },
                contact_person_en: { type: 'string' },
                contact_person_ar: { type: 'string' },
                notes_en: { type: 'string' },
                notes_ar: { type: 'string' }
              } 
            } 
          },
          stakeholder_engagement_plan_en: { type: 'string' },
          stakeholder_engagement_plan_ar: { type: 'string' }
        }
      },
      pestel: {
        type: 'object',
        properties: {
          political: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
          economic: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
          social: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
          technological: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
          environmental: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } },
          legal: { type: 'array', items: { type: 'object', properties: { factor_en: { type: 'string' }, factor_ar: { type: 'string' }, impact: { type: 'string' }, trend: { type: 'string' }, timeframe: { type: 'string' }, implications_en: { type: 'string' }, implications_ar: { type: 'string' } } } }
        }
      },
      swot: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } },
          weaknesses: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } },
          opportunities: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } },
          threats: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' }, priority: { type: 'string' } } } }
        }
      },
      scenarios: {
        type: 'object',
        properties: {
          best_case: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'string' } } },
          worst_case: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'string' } } },
          most_likely: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'string' } } }
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
                title_en: { type: 'string' },
                title_ar: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                category: { type: 'string' },
                likelihood: { type: 'string' },
                impact: { type: 'string' },
                mitigation_strategy_en: { type: 'string' },
                mitigation_strategy_ar: { type: 'string' },
                contingency_plan_en: { type: 'string' },
                contingency_plan_ar: { type: 'string' },
                owner: { type: 'string' }
              }
            }
          }
        }
      },
      dependencies: {
        type: 'object',
        properties: {
          dependencies: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, type: { type: 'string' }, source: { type: 'string' }, target: { type: 'string' }, criticality: { type: 'string' } } } },
          constraints: { type: 'array', items: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, type: { type: 'string' }, impact: { type: 'string' }, mitigation_en: { type: 'string' }, mitigation_ar: { type: 'string' } } } },
          assumptions: { type: 'array', items: { type: 'object', properties: { statement_en: { type: 'string' }, statement_ar: { type: 'string' }, category: { type: 'string' }, confidence: { type: 'string' }, validation_method_en: { type: 'string' }, validation_method_ar: { type: 'string' } } } }
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
                start_date: { type: 'string' },
                end_date: { type: 'string' },
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
          hr_requirements: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' }, notes_en: { type: 'string' }, notes_ar: { type: 'string' } } } },
          technology_requirements: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' }, notes_en: { type: 'string' }, notes_ar: { type: 'string' } } } },
          infrastructure_requirements: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' }, notes_en: { type: 'string' }, notes_ar: { type: 'string' } } } },
          budget_allocation: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, quantity: { type: 'string' }, cost: { type: 'string' }, notes_en: { type: 'string' }, notes_ar: { type: 'string' } } } }
        }
      },
      timeline: {
        type: 'object',
        properties: {
          phases: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, start_date: { type: 'string' }, end_date: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' }, objectives_covered: { type: 'array', items: { type: 'number' } } } } },
          milestones: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, date: { type: 'string' }, type: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' } } } }
        }
      },
      governance: {
        type: 'object',
        properties: {
          committees: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, role: { type: 'string' }, meeting_frequency: { type: 'string' }, responsibilities_en: { type: 'string' }, responsibilities_ar: { type: 'string' }, members: { type: 'array', items: { type: 'string' } } } } },
          reporting_frequency: { type: 'string' },
          escalation_path: { type: 'array', items: { type: 'string' } }
        }
      },
      communication: {
        type: 'object',
        properties: {
          key_messages: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } },
          internal_channels: { type: 'array', items: { type: 'string' } },
          external_channels: { type: 'array', items: { type: 'string' } }
        }
      },
      change: {
        type: 'object',
        properties: {
          readiness_assessment_en: { type: 'string' },
          readiness_assessment_ar: { type: 'string' },
          change_approach_en: { type: 'string' },
          change_approach_ar: { type: 'string' },
          resistance_management_en: { type: 'string' },
          resistance_management_ar: { type: 'string' },
          training_plan: { type: 'array', items: { type: 'object', properties: { name_en: { type: 'string' }, name_ar: { type: 'string' }, target_audience: { type: 'string' }, duration: { type: 'string' }, timeline: { type: 'string' } } } }
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
          if (data.name_ar) updates.name_ar = data.name_ar;

          if (data.vision_en) updates.vision_en = data.vision_en;
          if (data.vision_ar) updates.vision_ar = data.vision_ar;
          if (data.mission_en) updates.mission_en = data.mission_en;
          if (data.mission_ar) updates.mission_ar = data.mission_ar;
          if (data.description_en) updates.description_en = data.description_en;
          if (data.description_ar) updates.description_ar = data.description_ar;

          // Duration & Resources
          if (data.start_year) updates.start_year = parseInt(data.start_year) || updates.start_year;
          if (data.end_year) updates.end_year = parseInt(data.end_year) || updates.end_year;
          if (data.budget_range) updates.budget_range = data.budget_range;

          // Target Sectors, Themes, Technologies, Programs, Regions
          if (Array.isArray(data.target_sectors)) updates.target_sectors = data.target_sectors;
          if (Array.isArray(data.strategic_themes)) updates.strategic_themes = data.strategic_themes;
          if (Array.isArray(data.focus_technologies)) updates.focus_technologies = data.focus_technologies;
          if (Array.isArray(data.vision_2030_programs)) updates.vision_2030_programs = data.vision_2030_programs;
          if (Array.isArray(data.target_regions)) updates.target_regions = data.target_regions;

          // Bilingual stakeholders
          if (Array.isArray(data.quick_stakeholders)) {
            updates.quick_stakeholders = data.quick_stakeholders.map(s => {
              if (typeof s === 'object' && s !== null) {
                return { name_en: s.name_en || '', name_ar: s.name_ar || '' };
              }
              // Backward compatibility for string format
              return { name_en: String(s).trim(), name_ar: '' };
            }).filter(s => s.name_en || s.name_ar);
          }

          // Bilingual discovery inputs
          if (typeof data.key_challenges_en === 'string') updates.key_challenges_en = data.key_challenges_en;
          if (typeof data.key_challenges_ar === 'string') updates.key_challenges_ar = data.key_challenges_ar;
          if (typeof data.available_resources_en === 'string') updates.available_resources_en = data.available_resources_en;
          if (typeof data.available_resources_ar === 'string') updates.available_resources_ar = data.available_resources_ar;
          if (typeof data.initial_constraints_en === 'string') updates.initial_constraints_en = data.initial_constraints_en;
          if (typeof data.initial_constraints_ar === 'string') updates.initial_constraints_ar = data.initial_constraints_ar;

          // Backward compatibility (old single-language fields)
          if (typeof data.key_challenges === 'string' && typeof updates.key_challenges_en !== 'string') updates.key_challenges_en = data.key_challenges;
          if (typeof data.available_resources === 'string' && typeof updates.available_resources_en !== 'string') updates.available_resources_en = data.available_resources;
          if (typeof data.initial_constraints === 'string' && typeof updates.initial_constraints_en !== 'string') updates.initial_constraints_en = data.initial_constraints;
        } else if (stepKey === 'vision') {
          // Step 2 focuses only on Core Values and Strategic Pillars (Vision/Mission are in Step 1)
          if (Array.isArray(data.core_values) && data.core_values.length > 0) {
            updates.core_values = data.core_values.map((v, i) => ({ 
              ...v, 
              id: Date.now().toString() + i,
              name_en: v.name_en || '',
              name_ar: v.name_ar || '',
              description_en: v.description_en || '',
              description_ar: v.description_ar || ''
            }));
          }
          if (Array.isArray(data.strategic_pillars) && data.strategic_pillars.length > 0) {
            updates.strategic_pillars = data.strategic_pillars.map((p, i) => ({ 
              ...p, 
              id: Date.now().toString() + 'p' + i, 
              icon: 'Target',
              name_en: p.name_en || '',
              name_ar: p.name_ar || '',
              description_en: p.description_en || '',
              description_ar: p.description_ar || ''
            }));
          }
        } else if (stepKey === 'stakeholders') {
          if (data.stakeholders) {
            updates.stakeholders = data.stakeholders.map((s, i) => ({ 
              ...s, 
              id: Date.now().toString() + i,
              name_en: s.name_en || s.name || '',
              name_ar: s.name_ar || '',
              influence_strategy_en: s.influence_strategy_en || s.influence_strategy || '',
              influence_strategy_ar: s.influence_strategy_ar || '',
              type: s.type || 'GOVERNMENT',
              power: s.power || 'medium',
              interest: s.interest || 'medium',
              engagement_level: s.engagement_level || 'consult',
              contact_person_en: s.contact_person_en || s.contact_person || '',
              contact_person_ar: s.contact_person_ar || '',
              notes_en: s.notes_en || s.notes || '',
              notes_ar: s.notes_ar || ''
            }));
          }
          if (data.stakeholder_engagement_plan_en) {
            updates.stakeholder_engagement_plan_en = data.stakeholder_engagement_plan_en;
          }
          if (data.stakeholder_engagement_plan_ar) {
            updates.stakeholder_engagement_plan_ar = data.stakeholder_engagement_plan_ar;
          }
          // Backward compatibility
          if (data.stakeholder_engagement_plan && !data.stakeholder_engagement_plan_en) {
            updates.stakeholder_engagement_plan_en = data.stakeholder_engagement_plan;
          }
        } else if (stepKey === 'pestel') {
          // PESTEL UI expects bilingual objects
          const mapPestelItems = (items) => (items || []).map((item, i) => ({
            id: Date.now().toString() + i,
            factor_en: item.factor_en || item.factor || '',
            factor_ar: item.factor_ar || '',
            impact: item.impact || 'medium',
            trend: item.trend || 'stable',
            timeframe: item.timeframe || 'medium_term',
            implications_en: item.implications_en || item.implications || '',
            implications_ar: item.implications_ar || ''
          }));
          updates.pestel = {
            political: mapPestelItems(data.political),
            economic: mapPestelItems(data.economic),
            social: mapPestelItems(data.social),
            technological: mapPestelItems(data.technological),
            environmental: mapPestelItems(data.environmental),
            legal: mapPestelItems(data.legal)
          };
        } else if (stepKey === 'swot') {
          // SWOT UI expects bilingual objects
          const mapSwotItems = (items) => (items || []).map((item, i) => ({
            id: Date.now().toString() + i,
            text_en: item.text_en || item.text || '',
            text_ar: item.text_ar || '',
            priority: item.priority || 'medium'
          }));
          updates.swot = {
            strengths: mapSwotItems(data.strengths),
            weaknesses: mapSwotItems(data.weaknesses),
            opportunities: mapSwotItems(data.opportunities),
            threats: mapSwotItems(data.threats)
          };
        } else if (stepKey === 'scenarios') {
          // Scenarios UI expects bilingual outcomes
          const mapScenario = (scenario) => ({
            description_en: scenario?.description_en || scenario?.description || '',
            description_ar: scenario?.description_ar || '',
            assumptions: (scenario?.assumptions || []).map(a => 
              typeof a === 'string' ? { text_en: a, text_ar: '' } : { text_en: a.text_en || a.text || '', text_ar: a.text_ar || '' }
            ),
            outcomes: (scenario?.outcomes || []).map(o => 
              typeof o === 'string' 
                ? { metric_en: o, metric_ar: '', value: '' } 
                : { metric_en: o.metric_en || o.metric || '', metric_ar: o.metric_ar || '', value: o.value || '' }
            ),
            probability: scenario?.probability || ''
          });
          updates.scenarios = {
            best_case: mapScenario(data.best_case),
            worst_case: mapScenario(data.worst_case),
            most_likely: mapScenario(data.most_likely)
          };
        } else if (stepKey === 'risks' && data.risks) {
          const scoreMap = { low: 1, medium: 2, high: 3 };
          updates.risks = data.risks.map((r, i) => {
            const likelihood = r.likelihood || 'medium';
            const impact = r.impact || 'medium';
            return {
              id: Date.now().toString() + i,
              title_en: r.title_en || r.title || '',
              title_ar: r.title_ar || '',
              description_en: r.description_en || r.description || '',
              description_ar: r.description_ar || '',
              category: r.category || 'OPERATIONAL',
              likelihood,
              impact,
              risk_score: (scoreMap[likelihood] || 0) * (scoreMap[impact] || 0),
              mitigation_strategy_en: r.mitigation_strategy_en || r.mitigation_strategy || r.mitigation || '',
              mitigation_strategy_ar: r.mitigation_strategy_ar || '',
              contingency_plan_en: r.contingency_plan_en || r.contingency_plan || '',
              contingency_plan_ar: r.contingency_plan_ar || '',
              owner: r.owner || '',
              status: 'identified'
            };
          });
        } else if (stepKey === 'dependencies') {
          if (data.dependencies) {
            updates.dependencies = data.dependencies.map((d, i) => ({ 
              ...d, 
              id: Date.now().toString() + i,
              name_en: d.name_en || d.name || '',
              name_ar: d.name_ar || '',
              status: 'pending'
            }));
          }
          if (data.constraints) {
            updates.constraints = data.constraints.map((c, i) => ({ 
              ...c, 
              id: Date.now().toString() + i,
              description_en: c.description_en || c.description || '',
              description_ar: c.description_ar || '',
              mitigation_en: c.mitigation_en || c.mitigation || '',
              mitigation_ar: c.mitigation_ar || ''
            }));
          }
          if (data.assumptions) {
            updates.assumptions = data.assumptions.map((a, i) => ({ 
              ...a, 
              id: Date.now().toString() + i,
              statement_en: a.statement_en || a.statement || '',
              statement_ar: a.statement_ar || '',
              validation_method_en: a.validation_method_en || a.validation_method || '',
              validation_method_ar: a.validation_method_ar || ''
            }));
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
            start_date: a.start_date || '',
            end_date: a.end_date || '',
            owner: a.owner || '',
            deliverables: Array.isArray(a.deliverables) ? a.deliverables : [],
            dependencies: Array.isArray(a.dependencies) ? a.dependencies : []
          }));
        } else if (stepKey === 'resources') {
          const mapResource = (r, i, prefix) => ({
            ...r,
            id: Date.now().toString() + prefix + i,
            name_en: r.name_en || r.name || '',
            name_ar: r.name_ar || '',
            notes_en: r.notes_en || r.notes || '',
            notes_ar: r.notes_ar || ''
          });
          updates.resource_plan = {
            hr_requirements: (data.hr_requirements || []).map((r, i) => mapResource(r, i, 'hr')),
            technology_requirements: (data.technology_requirements || []).map((r, i) => mapResource(r, i, 'tech')),
            infrastructure_requirements: (data.infrastructure_requirements || []).map((r, i) => mapResource(r, i, 'infra')),
            budget_allocation: (data.budget_allocation || []).map((r, i) => mapResource(r, i, 'budget'))
          };
        } else if (stepKey === 'timeline') {
          if (data.phases) {
            updates.phases = data.phases.map((p, i) => ({ 
              ...p, 
              id: Date.now().toString() + 'phase' + i,
              description_en: p.description_en || p.description || '',
              description_ar: p.description_ar || '',
              objectives_covered: Array.isArray(p.objectives_covered) ? p.objectives_covered : []
            }));
          }
          if (data.milestones) {
            updates.milestones = data.milestones.map((m, i) => ({ 
              ...m, 
              id: Date.now().toString() + 'ms' + i,
              status: 'planned',
              description_en: m.description_en || m.description || '',
              description_ar: m.description_ar || ''
            }));
          }
        } else if (stepKey === 'governance') {
          const escalationPath = Array.isArray(data.escalation_path)
            ? data.escalation_path
            : (typeof data.escalation_path === 'string'
              ? data.escalation_path.split(/\n|;|,/).map(s => s.trim()).filter(Boolean)
              : []);

          updates.governance = {
            ...wizardData.governance,
            committees: (data.committees || []).map((c, i) => ({
              ...c,
              id: Date.now().toString() + i,
              name_en: c.name_en || c.name || '',
              name_ar: c.name_ar || '',
              responsibilities_en: c.responsibilities_en || c.responsibilities || '',
              responsibilities_ar: c.responsibilities_ar || '',
              members: Array.isArray(c.members) ? c.members.map(m => String(m).trim()).filter(Boolean) : []
            })),
            reporting_frequency: data.reporting_frequency || 'monthly',
            escalation_path: escalationPath
          };
        } else if (stepKey === 'communication') {
          // Convert string key_messages to bilingual objects
          const keyMessages = (data.key_messages || []).map((m, i) => 
            typeof m === 'string' 
              ? { id: Date.now().toString() + i, text_en: m, text_ar: '' } 
              : { id: Date.now().toString() + i, text_en: m.text_en || '', text_ar: m.text_ar || '' }
          );
          updates.communication_plan = {
            ...wizardData.communication_plan,
            key_messages: keyMessages,
            internal_channels: data.internal_channels || [],
            external_channels: data.external_channels || []
          };
        } else if (stepKey === 'change') {
          updates.change_management = {
            ...wizardData.change_management,
            readiness_assessment_en: data.readiness_assessment_en || data.readiness_assessment || '',
            readiness_assessment_ar: data.readiness_assessment_ar || '',
            change_approach_en: data.change_approach_en || data.change_approach || '',
            change_approach_ar: data.change_approach_ar || '',
            resistance_management_en: data.resistance_management_en || data.resistance_management || '',
            resistance_management_ar: data.resistance_management_ar || '',
            training_plan: (data.training_plan || []).map((tp, i) => ({ 
              ...tp, 
              id: Date.now().toString() + 'train' + i,
              name_en: tp.name_en || tp.name || '',
              name_ar: tp.name_ar || ''
            }))
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
