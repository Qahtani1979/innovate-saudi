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
      stakeholders: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Vision 2030 Programs: Quality of Life, Housing (70% ownership), NTP, Thriving Cities
- Innovation Ecosystem: KACST, TAQNIA, Misk Foundation, Monsha'at, Research Chair Programs
- Tech & Innovation Partners: SDAIA, MCIT, STC, stc solutions, Elm, Thiqah, Saudi Venture Capital
- Universities & Research: KSU, KFUPM, KAUST, PNU, KAU, Effat, Alfaisal
- Innovation Hubs: NEOM, The Line, Oxagon, KAFD Innovation District, Riyadh Technopolis
- Incubators/Accelerators: Badir, Flat6Labs, 500 Global, Wadi Makkah
- Key Systems: Balady Platform, Sakani, ANSA, Absher, Etimad

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}${context.planNameAr ? ` (${context.planNameAr})` : ''}
- Vision: ${context.vision || 'Not yet defined'}
- Mission: ${context.mission || 'Not yet defined'}
- Target Sectors: ${context.sectors.length > 0 ? context.sectors.join(', ') : 'General municipal services'}
- Strategic Themes: ${context.themes.length > 0 ? context.themes.join(', ') : 'General improvement'}
- Focus Technologies: ${context.technologies.length > 0 ? context.technologies.join(', ') : 'General technology'}
- Vision 2030 Programs: ${context.vision2030Programs.length > 0 ? context.vision2030Programs.join(', ') : 'General Vision 2030'}
- Target Regions: ${context.regions.length > 0 ? context.regions.join(', ') : 'Kingdom-wide'}
- Timeline: ${context.startYear} - ${context.endYear}
- Budget Range: ${context.budgetRange || 'To be determined'}

## EXISTING QUICK STAKEHOLDERS:
${context.stakeholders.length > 0 ? context.stakeholders.map(s => `- ${s.name_en || s}${s.name_ar ? ` (${s.name_ar})` : ''}`).join('\n') : '- None specified yet'}

## DISCOVERY INPUTS:
- Key Challenges: ${context.keyChallenges || 'General challenges'}
- Available Resources: ${context.availableResources || 'Standard resources'}
- Initial Constraints: ${context.initialConstraints || 'Standard constraints'}

---

## REQUIREMENTS:

### PART 1: STAKEHOLDERS (Generate 14-18 stakeholders)

Each stakeholder MUST have ALL fields (bilingual):
- name_en / name_ar: Full organization/role name
- type: GOVERNMENT | PRIVATE | ACADEMIC | NGO | COMMUNITY | INTERNATIONAL | INTERNAL
- power: low | medium | high
- interest: low | medium | high
- engagement_level: inform | consult | involve | collaborate | empower
- influence_strategy_en / influence_strategy_ar: 2-3 sentences on engagement approach
- contact_person_en / contact_person_ar: Suggested role/title for primary contact
- notes_en / notes_ar: Timing, special considerations, relationship notes

**MANDATORY DISTRIBUTION:**

**GOVERNMENT (4-5 stakeholders):**
- Vision Realization Programs (VRO, NTP PMO)
- Regulatory bodies (MOMRA, CITC, PDPL Authority)
- Funding agencies (MOF, PIF, NDF)
- Sister ministries (MCIT, MHRSD, MOT)

**INNOVATION & R&D (3-4 stakeholders) - CRITICAL:**
- Research institutions: KACST, KAUST Research Office, university research centers
- Innovation agencies: SDAIA, Monsha'at Innovation, Research Products Development Company (RPDC)
- Tech incubators: Badir Program, Wadi Makkah Ventures, KAUST Innovation
- National labs: National Center for AI, Cyber Security Center

**PRIVATE SECTOR & TECH (3-4 stakeholders):**
- Technology vendors for focus technologies (${context.technologies.join(', ') || 'AI, IoT, etc.'})
- System integrators: Elm, Thiqah, stc solutions
- PropTech/GovTech startups relevant to sectors
- International tech partners (if applicable)

**ACADEMIC (2-3 stakeholders):**
- Leading universities: KSU, KFUPM, KAUST for research partnerships
- Research chairs aligned with plan focus
- Student innovation programs (Misk, Monsha'at Youth)

**COMMUNITY & INTERNAL (2-3 stakeholders):**
- Citizen groups, professional associations
- Municipal departments, Amanat innovation units
- Chamber of Commerce, industry associations

**POWER/INTEREST MATRIX:**
- 3-4 High Power + High Interest (Manage Closely)
- 3-4 High Power + Low/Medium Interest (Keep Satisfied)
- 3-4 Low/Medium Power + High Interest (Keep Informed)
- 3-4 Low Power + Low Interest (Monitor)

---

### PART 2: STAKEHOLDER ENGAGEMENT PLAN (Bilingual)

Generate comprehensive engagement plan:
- stakeholder_engagement_plan_en: 3-5 paragraphs in English
- stakeholder_engagement_plan_ar: 3-5 paragraphs in Arabic (formal فصحى)

Must include:
1. Overall engagement philosophy with emphasis on innovation co-creation
2. Communication cadence for different stakeholder types
3. Key engagement milestones (${context.startYear}-${context.endYear})
4. Innovation partnership mechanisms (R&D collaborations, pilot partnerships, knowledge transfer)
5. Feedback mechanisms and resistance mitigation

---

## INNOVATION STAKEHOLDER EXAMPLES:

**R&D Partners:**
- "King Abdulaziz City for Science and Technology (KACST)" - National R&D coordination, technology transfer
- "KAUST Innovation & Economic Development" - Deep tech research, startup ecosystem
- "SDAIA National Center for AI" - AI research, ethics, governance

**Tech Innovation:**
- "Badir Program for Technology Incubators" - Startup incubation, municipal tech solutions
- "Monsha'at SME Innovation Programs" - SME tech adoption, innovation funding
- "Saudi Venture Capital Company" - Innovation investment, growth capital

**Academic Research:**
- "KSU Smart Cities Research Chair" - Urban innovation research
- "KFUPM Center for Environment & Water" - Sustainability research
- "Research Products Development Company (RPDC)" - University research commercialization

Be specific to plan context. Reference actual Saudi innovation ecosystem entities.`,
      pestel: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT Digital Government, Monsha'at
- R&D Infrastructure: KAUST, KFUPM, national research centers, innovation hubs
- Key Initiatives: Saudi Green Initiative, National Industrial Strategy, Digital Government Strategy

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}

---

## REQUIREMENTS:
Generate factors for ALL 6 PESTEL categories. Each category MUST have 3-4 factors.

For EACH factor, provide ALL fields (bilingual):
- factor_en / factor_ar: Factor name/description
- impact: "low" | "medium" | "high"
- trend: "declining" | "stable" | "growing"
- timeframe: "short_term" | "medium_term" | "long_term"
- implications_en / implications_ar: Strategic implications (1-2 sentences)

---

## CATEGORY GUIDANCE WITH INNOVATION/R&D FOCUS:

### 1. POLITICAL:
- Vision 2030 governance and VRP oversight
- Municipal reform agenda and decentralization
- Innovation policy support (regulatory sandboxes, innovation zones)
- Public-private partnership frameworks
- R&D funding prioritization in national budgets

### 2. ECONOMIC:
- Economic diversification beyond oil (NIDLP targets)
- PIF and sovereign wealth investment in innovation
- PPP opportunities for municipal innovation
- Venture capital and startup ecosystem growth
- R&D tax incentives and innovation funding programs
- Budget allocation for digital transformation

### 3. SOCIAL:
- Youth population and digital natives (70% under 35)
- Rising citizen expectations for smart services
- Innovation culture and entrepreneurship mindset
- Talent availability for emerging technologies
- Public acceptance of AI and automation
- Research talent retention and attraction

### 4. TECHNOLOGICAL (CRITICAL - INCLUDE R&D):
- AI/ML maturity and SDAIA governance framework
- IoT infrastructure readiness (5G, LoRaWAN)
- Cloud adoption and data center availability
- Digital twins and simulation capabilities
- R&D infrastructure (labs, testbeds, innovation centers)
- Technology transfer mechanisms (KACST, universities)
- Open innovation platforms and APIs
- Cybersecurity capabilities and threats

### 5. ENVIRONMENTAL:
- Saudi Green Initiative commitments
- Circular economy and waste innovation
- Water technology and desalination R&D
- Clean energy transition and solar adoption
- Climate adaptation technologies
- Green building standards and innovation

### 6. LEGAL:
- PDPL data protection compliance
- AI ethics and governance regulations (SDAIA)
- Intellectual property and patent frameworks
- Cybersecurity law requirements
- Procurement regulations for innovation
- Open data and government transparency mandates

---

## DISTRIBUTION REQUIREMENTS:
- Each category: mix of high, medium, low impacts
- Each category: variety of trends (declining, stable, growing)
- Each category: mix of timeframes
- TECHNOLOGICAL category: At least 2 factors explicitly about R&D/innovation infrastructure

Be specific to Saudi Arabia. Reference actual programs, agencies, and frameworks.`,
      swot: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university research centers
- R&D Infrastructure: KAUST, KFUPM, national labs, innovation hubs, tech incubators
- Digital Platforms: Balady, Sakani, ANSA, Absher integration

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Sectors: ${context.sectors.join(', ')}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}
- Stakeholder Count: ${(wizardData.stakeholders || []).length}

## PESTEL INSIGHTS (from Step 4):
- Key Political: ${(wizardData.pestel?.political || []).slice(0, 2).map(f => f.factor_en).join('; ') || 'Not analyzed'}
- Key Technological: ${(wizardData.pestel?.technological || []).slice(0, 2).map(f => f.factor_en).join('; ') || 'Not analyzed'}

---

## REQUIREMENTS:
Generate items for ALL 4 SWOT categories. Each category MUST have 5-7 items.

For EACH item, provide (bilingual):
- text_en / text_ar: SWOT item description (1-2 sentences)
- priority: "low" | "medium" | "high"

---

## CATEGORY GUIDANCE WITH INNOVATION/R&D FOCUS:

### STRENGTHS (Internal positive - include 1-2 innovation-related):
**Standard:**
- Government support and Vision 2030 alignment
- Digital infrastructure (Balady, national platforms)
- Financial resources and funding access
- Strategic geographic advantages
- Existing partnerships

**Innovation-Specific (MUST include):**
- Access to national R&D infrastructure (KACST, KAUST, KFUPM)
- Established innovation partnerships (SDAIA, tech vendors)
- Digital transformation experience and capabilities
- Innovation budget allocation or R&D funding access
- Pilot program experience and testbed availability
- Technology talent pool and training programs

### WEAKNESSES (Internal negative - include 1-2 innovation-related):
**Standard:**
- Capacity or skill gaps
- Legacy systems and processes
- Resource constraints
- Coordination challenges
- Data management issues

**Innovation-Specific (MUST include):**
- Limited R&D experience or innovation capacity
- Shortage of specialized tech talent (AI, IoT, data science)
- Weak innovation culture or risk aversion
- Insufficient pilot/experimentation infrastructure
- Technology vendor dependency
- Knowledge transfer gaps from research to operations

### OPPORTUNITIES (External positive - include 2-3 innovation-related):
**Standard:**
- Vision 2030 funding and programs
- Regional economic development
- Demographic dividend (youth population)
- International partnerships

**Innovation-Specific (MUST include):**
- National innovation funding (SIDF, Monsha'at, VC ecosystem)
- University research partnerships and knowledge transfer
- GovTech/PropTech startup ecosystem growth
- SDAIA AI adoption support and frameworks
- Innovation sandbox and regulatory flexibility
- Technology transfer from NEOM, megaprojects
- Open innovation platforms and hackathons
- International R&D collaboration opportunities

### THREATS (External negative - include 1-2 innovation-related):
**Standard:**
- Economic volatility
- Regulatory changes
- Environmental challenges
- Public expectation management

**Innovation-Specific (MUST include):**
- Rapid technology obsolescence
- Cybersecurity threats and data breaches
- AI ethics and governance risks
- Innovation talent competition (brain drain)
- Technology vendor lock-in risks
- R&D project failure and sunk costs
- Disruptive technology from competitors

---

## DISTRIBUTION REQUIREMENTS:
- Each category: mix of high, medium, low priorities
- At least 2 HIGH priority items per category
- EXPLICIT innovation/R&D items in each category as specified above

Be specific to Saudi municipal context. Reference actual systems, programs, and ecosystem players.`,
      scenarios: `Create comprehensive scenario planning for this Saudi municipal strategic plan:

**STRATEGIC PLAN CONTEXT:**
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Target Regions: ${(wizardData.target_regions || []).join(', ') || 'Kingdom-wide'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Vision 2030 Programs: ${(wizardData.vision_2030_programs || []).join(', ') || 'Not specified'}

**STRATEGIC PILLARS (from Step 2):**
${(wizardData.strategic_pillars || []).map(p => `- ${p.name_en || p.name_ar}`).join('\n') || 'Not defined yet'}

**KEY STAKEHOLDERS (from Step 3):**
${(wizardData.stakeholders || []).slice(0, 5).map(s => `- ${s.name_en || s.name_ar} (${s.type}, Power: ${s.power}, Interest: ${s.interest})`).join('\n') || 'Not defined yet'}

**PESTEL SUMMARY (from Step 4):**
- Political factors: ${(wizardData.pestel?.political || []).length} identified
- Economic factors: ${(wizardData.pestel?.economic || []).length} identified
- Key opportunities: ${(wizardData.pestel?.political || []).filter(f => f.trend === 'growing').map(f => f.factor_en).slice(0, 2).join(', ') || 'Vision 2030 support'}
- Key threats: ${(wizardData.pestel?.economic || []).filter(f => f.trend === 'declining').map(f => f.factor_en).slice(0, 2).join(', ') || 'Economic volatility'}

**SWOT SUMMARY (from Step 5):**
- Top Strengths: ${(wizardData.swot?.strengths || []).slice(0, 2).map(s => s.text_en).join('; ') || 'Not defined yet'}
- Top Weaknesses: ${(wizardData.swot?.weaknesses || []).slice(0, 2).map(w => w.text_en).join('; ') || 'Not defined yet'}
- Top Opportunities: ${(wizardData.swot?.opportunities || []).slice(0, 2).map(o => o.text_en).join('; ') || 'Not defined yet'}
- Top Threats: ${(wizardData.swot?.threats || []).slice(0, 2).map(t => t.text_en).join('; ') || 'Not defined yet'}

**REQUIREMENTS:**
Generate ALL 3 scenarios: best_case, worst_case, and most_likely.

**CRITICAL**: Each scenario MUST include a "probability" field as a NUMBER from 0 to 100 (no % sign).

For EACH scenario, provide ALL these fields in BOTH English and Arabic:

1. **probability**: REQUIRED - Likelihood as a number from 0 to 100. This field is mandatory!

2. **description_en / description_ar**: A 2-3 sentence narrative describing this scenario (what the future looks like)

3. **assumptions**: Array of 3-5 key assumptions. Each assumption must have:
   - text_en: Assumption in English
   - text_ar: Assumption in Arabic (formal فصحى)

4. **outcomes**: Array of 4-6 measurable outcomes with REALISTIC VALUES. Each outcome must have:
   - metric_en: The metric/outcome name in English
   - metric_ar: The metric/outcome name in Arabic
   - value: The expected value/result - USE REALISTIC SAUDI MUNICIPAL BENCHMARKS

**REALISTIC OUTCOME VALUE EXAMPLES (adapt to plan context):**

For BEST CASE outcomes:
- "Citizen satisfaction: 92%"
- "Digital service adoption: 85%"
- "Budget utilization efficiency: 98%"
- "Project completion rate: 95%"
- "Private sector investment: SAR 2.5 billion"
- "Job creation: 15,000 new positions"
- "E-service transactions: 5 million annually"
- "Carbon emission reduction: 25%"

For WORST CASE outcomes:
- "Citizen satisfaction: 55%"
- "Digital service adoption: 35%"
- "Budget overrun: +40%"
- "Project completion rate: 45%"
- "Implementation delay: 24 months"
- "Staff turnover: 35%"
- "Service disruption incidents: 50+ annually"

For MOST LIKELY outcomes:
- "Citizen satisfaction: 75%"
- "Digital service adoption: 65%"
- "Budget variance: ±10%"
- "Project completion rate: 78%"
- "Private sector investment: SAR 800 million"
- "Job creation: 5,000 new positions"
- "E-service transactions: 2 million annually"

**SCENARIO GUIDANCE FOR SAUDI CONTEXT:**

BEST CASE (Optimistic - probability: 20):
- Vision 2030 goals exceeded ahead of schedule
- Strong private sector PPP partnerships
- Rapid digital transformation adoption
- High citizen satisfaction and engagement
- Budget surplus enabling additional initiatives
- International recognition for innovation

WORST CASE (Pessimistic - probability: 20):
- Economic challenges from oil price volatility
- Significant implementation delays (12-24 months)
- Budget constraints requiring scope reduction
- Low stakeholder engagement and resistance to change
- Regulatory obstacles and compliance issues
- Talent shortage and high turnover

MOST LIKELY (Realistic - probability: 60):
- Steady progress with manageable challenges
- Moderate achievement of 70-80% of targets
- Mixed stakeholder response requiring ongoing engagement
- Some budget adjustments within ±15% variance
- Gradual capacity building with external support
- Phased rollout with lessons learned integration

**DISTRIBUTION:**
- Probabilities MUST sum to 100 (typically: 20 + 20 + 60)
- Each scenario should reference the SWOT and PESTEL factors above
- Outcomes should be sector-specific and measurable
- Values should be realistic for Saudi municipal context`,
      risks: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Tech Infrastructure: Balady, Sakani, ANSA, national data platforms
- Regulatory Framework: PDPL, SDAIA AI Ethics, CITC, cybersecurity laws

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## PESTEL THREATS (from Step 4):
${Object.entries(wizardData.pestel || {}).map(([category, factors]) => 
  (factors || []).filter(f => f.impact === 'high' || f.trend === 'declining').slice(0, 2).map(f => `- ${category.toUpperCase()}: ${f.factor_en || 'N/A'}`).join('\n')
).filter(Boolean).join('\n') || 'Not analyzed yet'}

## SWOT WEAKNESSES & THREATS (from Step 5):
- Weaknesses: ${(wizardData.swot?.weaknesses || []).slice(0, 3).map(w => w.text_en).join('; ') || 'Not defined'}
- Threats: ${(wizardData.swot?.threats || []).slice(0, 3).map(t => t.text_en).join('; ') || 'Not defined'}

## WORST-CASE SCENARIO (from Step 6):
${wizardData.scenarios?.worst_case?.description_en || 'Not defined yet'}

## KEY STAKEHOLDERS:
${(wizardData.stakeholders || []).filter(s => s.power === 'high').slice(0, 3).map(s => `- ${s.name_en || s.name_ar} (${s.type})`).join('\n') || 'Not defined'}

---

## REQUIREMENTS:
Generate 12-16 risks covering ALL categories with explicit innovation/R&D risks.

For EACH risk, provide ALL fields (bilingual):
- title_en / title_ar: Short risk title (5-10 words)
- description_en / description_ar: Detailed description (2-3 sentences)
- category: STRATEGIC | OPERATIONAL | FINANCIAL | REGULATORY | TECHNOLOGY | INNOVATION | REPUTATIONAL | POLITICAL | ENVIRONMENTAL
- likelihood: low | medium | high
- impact: low | medium | high
- mitigation_strategy_en / mitigation_strategy_ar: Preventive actions (2-3 sentences)
- contingency_plan_en / contingency_plan_ar: Response if risk occurs (2-3 sentences)
- owner: Role/department responsible

---

## CATEGORY DISTRIBUTION (MANDATORY):

### STRATEGIC (2 risks):
- Vision 2030 misalignment or VRP milestone failure
- Stakeholder disengagement or priority conflicts

### OPERATIONAL (2 risks):
- Capacity gaps and skill shortages
- Cross-department coordination failures

### FINANCIAL (2 risks):
- Budget overruns or funding delays
- ROI uncertainty on innovation investments

### REGULATORY (1-2 risks):
- PDPL/data protection non-compliance
- Municipal law or policy changes

### TECHNOLOGY (2 risks):
- System integration failures (Balady, legacy systems)
- Cybersecurity breaches or data loss

### INNOVATION/R&D (2-3 risks) - CRITICAL NEW CATEGORY:
- **Pilot Program Failure**: Innovation pilots fail to demonstrate value, wasting R&D investment
- **Technology Obsolescence**: Selected technologies become outdated before full deployment
- **R&D Partner Dependency**: Over-reliance on single research partner or vendor
- **Innovation Talent Drain**: Key technical staff leave for private sector or competitors
- **Proof-of-Concept to Scale Gap**: Successful POCs fail to scale to production
- **AI/ML Model Bias**: AI systems produce biased or unfair outcomes
- **Open Innovation IP Risks**: Intellectual property disputes from collaborative R&D

### REPUTATIONAL (1 risk):
- Public perception of failed innovation or wasted funds

### POLITICAL (1-2 risks):
- Leadership changes affecting innovation priorities
- Inter-ministry coordination breakdown

### ENVIRONMENTAL (1 risk):
- Sustainability targets missed or green initiative compliance

---

## LIKELIHOOD/IMPACT DISTRIBUTION:
- At least 3-4 HIGH likelihood risks
- At least 3-4 HIGH impact risks
- At least 2-3 risks should be HIGH/HIGH (critical)
- Mix of LOW, MEDIUM across remaining

---

## INNOVATION RISK EXAMPLES:

**INNOVATION Category:**
- "AI Model Performance Degradation" - ML models drift over time, requiring ongoing retraining and monitoring
- "Pilot-to-Production Scaling Failure" - Successful small-scale pilots fail when deployed city-wide
- "Research Partner Misalignment" - University/KACST research priorities diverge from municipal needs
- "Innovation Investment ROI Uncertainty" - Difficulty measuring tangible returns on R&D spending

**TECHNOLOGY Category:**
- "Legacy System Integration Complexity" - Connecting new innovations to Balady/Baladiya systems
- "Data Quality for AI/ML" - Insufficient or biased training data affecting model accuracy
- "Vendor Lock-in from Proprietary Solutions" - Dependence on single technology vendor

**FINANCIAL Category:**
- "Innovation Budget Reallocation" - R&D funds redirected to operational priorities
- "VC/Startup Partner Failure" - Innovation partners face funding or business challenges

Be specific to plan context. Reference actual Saudi systems, agencies, and innovation ecosystem.`,
      kpis: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Key Systems: Balady, Sakani, ANSA, national data platforms
- Innovation Priorities: AI/ML, IoT, Digital Twins, Smart Cities, GovTech

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Budget Range: ${wizardData.budget_range || 'Not specified'}

## OBJECTIVES (from Step 9):
${context.objectives.map((o, i) => \`\${i + 1}. \${o.name_en || o.name_ar} (\${o.priority || 'medium'} priority)\`).join('\\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate 2-4 KPIs per objective, including INNOVATION-SPECIFIC KPIs.

For EACH KPI, provide ALL fields (bilingual):
- name_en / name_ar: Clear KPI name
- unit: Measurement unit (%, count, SAR, days, score, etc.)
- baseline_value: Current/starting value
- target_value: Target to achieve by end of plan
- objective_index: Which objective this KPI measures (0-based index)
- frequency: "monthly" | "quarterly" | "annual"
- data_source: Where data will come from
- owner: Role/department responsible

---

## KPI CATEGORIES (MUST include mix):

### OUTCOME KPIs (Impact):
- Citizen satisfaction scores
- Service delivery improvements
- Quality of life indicators
- Housing/infrastructure targets

### OUTPUT KPIs (Deliverables):
- Projects completed
- Services launched
- Units delivered
- Systems deployed

### EFFICIENCY KPIs (Process):
- Cost per transaction
- Processing time reduction
- Resource utilization
- Budget variance

### INNOVATION KPIs (MANDATORY - include 1-2 per objective where relevant):
**R&D Investment:**
- "R&D Spending as % of Budget" - Target: 3-5% of total budget
- "Innovation Fund Utilization Rate" - % of allocated innovation budget spent

**Pilot & Experimentation:**
- "Pilot Projects Launched" - Number of innovation pilots initiated
- "Pilot Success Rate" - % of pilots achieving success criteria
- "Pilot-to-Production Conversion" - % of successful pilots scaled

**Technology Adoption:**
- "Digital Service Adoption Rate" - % of citizens using digital services
- "AI/ML Models Deployed" - Number of AI solutions in production
- "IoT Sensors Deployed" - Connected devices per city/region
- "Smart City Index Score" - Composite smart city rating

**Innovation Partnerships:**
- "Active R&D Partnerships" - Number with KACST, universities, startups
- "Technology Transfer Agreements" - Commercialized research outputs
- "Startup Collaborations" - Pilots with GovTech/PropTech startups

**Capability Building:**
- "Staff with Digital Certifications" - % MCIT-certified
- "Innovation Training Hours" - Per employee annually
- "Internal Innovation Ideas Submitted" - Employee suggestions

**IP & Knowledge:**
- "Patents Filed" - Innovation IP protection
- "Research Publications" - Academic collaborations
- "Best Practices Documented" - Knowledge management

---

## DISTRIBUTION REQUIREMENTS:
- Each objective: 2-4 KPIs
- At least 30% should be Innovation/R&D KPIs
- Mix of leading (predictive) and lagging (outcome) indicators
- Realistic baselines and targets for Saudi municipal context

## DATA SOURCE EXAMPLES:
- Balady Platform Analytics
- Citizen Satisfaction Surveys
- SDAIA AI Governance Reports
- Municipal Finance Systems
- IoT Platform Dashboards
- HR Training Management System
- Innovation Portfolio Tracker

Be specific. Use realistic Saudi municipal benchmarks.`,
      actions: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, Badir, university research
- Tech Partners: Elm, Thiqah, stc solutions, international vendors
- Key Systems: Balady, Sakani, ANSA, Baladiya platforms

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear}
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## OBJECTIVES (from Step 9):
${context.objectives.map((o, i) => \`\${i + 1}. \${o.name_en || o.name_ar} (\${o.sector_code || 'General'})\`).join('\\n') || 'Not defined yet'}

## KEY RISKS (from Step 7):
${(wizardData.risks || []).filter(r => r.impact === 'high').slice(0, 3).map(r => \`- \${r.title_en || r.title_ar}\`).join('\\n') || 'Not assessed'}

---

## REQUIREMENTS:
Generate 2-4 action plans per objective, including INNOVATION/R&D ACTIONS.

For EACH action plan, provide ALL fields (bilingual):
- name_en / name_ar: Clear action name
- description_en / description_ar: Detailed description (2-3 sentences)
- objective_index: Which objective this supports (0-based index)
- type: "initiative" | "program" | "project" | "pilot" | "rd_project"
- priority: "high" | "medium" | "low"
- budget_estimate: Estimated cost in SAR
- start_date: Planned start (YYYY-MM format)
- end_date: Planned end (YYYY-MM format)
- owner: Role/department responsible
- deliverables: Array of specific outputs
- dependencies: Array of prerequisites

---

## ACTION TYPES (MUST include mix):

### INITIATIVES (Strategic):
- Large-scale transformation programs
- Multi-year strategic efforts
- Cross-department coordination

### PROGRAMS (Ongoing):
- Continuous improvement efforts
- Capacity building programs
- Service enhancement programs

### PROJECTS (Defined scope):
- Specific deliverable focus
- Clear start/end dates
- Measurable outputs

### PILOTS (CRITICAL - include for innovation objectives):
- **Technology Pilots**: Test new tech before full deployment
- **Process Pilots**: Trial new workflows in limited scope
- **Service Pilots**: Beta test citizen services
- **AI/ML Pilots**: Validate ML models with real data

### R&D PROJECTS (MANDATORY - include 1-2 per technology-focused objective):
- **Research Partnerships**: Collaborative R&D with KACST, KAUST, universities
- **Technology Assessments**: Evaluate emerging tech for municipal use
- **Proof of Concepts**: Validate technical feasibility
- **Innovation Labs**: Establish testbed environments
- **Knowledge Transfer**: Import expertise from research partners

---

## INNOVATION ACTION EXAMPLES:

**AI/ML Projects:**
- "AI-Powered Permit Processing POC" - Partner with SDAIA for automated permit review
- "Predictive Maintenance ML Model" - R&D with KFUPM for infrastructure monitoring

**IoT/Smart City:**
- "Smart Parking Pilot" - Deploy sensors in 3 districts, measure adoption
- "Environmental Monitoring Network" - IoT air/water quality sensors

**Digital Transformation:**
- "Balady Integration Sprint" - API development for legacy system connectivity
- "Citizen App 2.0 Beta" - UX research and pilot with citizen focus groups

**Innovation Capacity:**
- "Municipal Innovation Lab Setup" - Establish dedicated innovation space
- "GovTech Accelerator Partnership" - Collaborate with Badir/Flat6Labs
- "Staff Innovation Challenge" - Internal hackathon program

**Research Partnerships:**
- "Smart Cities Research Chair" - Co-fund with KSU/KFUPM
- "KAUST Urban Analytics MOU" - Data sharing for urban research
- "International Best Practice Study" - Benchmark against global smart cities

---

## DISTRIBUTION REQUIREMENTS:
- Each objective: 2-4 actions
- At least 25% should be pilots or R&D projects
- Mix of quick wins (6 months) and strategic initiatives (2+ years)
- Budget estimates should be realistic for Saudi municipal context

Be specific. Reference actual Saudi systems, agencies, and partners.`,
      resources: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Saudization Requirements: MHRSD quotas for technical positions
- Training Partners: MCIT Digital Academy, SDAIA AI certifications

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Timeline: ${context.startYear}-${context.endYear} (${(wizardData.end_year || 2030) - (wizardData.start_year || 2025)} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## OBJECTIVES (from Step 9):
${context.objectives.map((o, i) => \`\${i + 1}. \${o.name_en || o.name_ar}\`).join('\\n') || 'Not defined yet'}

## ACTION PLANS (from Step 12):
${(wizardData.action_plans || []).slice(0, 5).map(a => \`- \${a.name_en || a.name_ar} (\${a.type})\`).join('\\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate comprehensive resource plan with INNOVATION/R&D RESOURCES.

Provide 4 resource categories:

### 1. HR REQUIREMENTS (8-12 items)
For EACH, provide (bilingual):
- name_en / name_ar: Role/position title
- quantity: Number needed
- cost: Annual cost in SAR
- notes_en / notes_ar: Skills required, hiring timeline

**MUST include Innovation/R&D roles:**
- Data Scientists / ML Engineers
- AI/ML Specialists (SDAIA-certified)
- IoT/Smart City Engineers
- Innovation Program Managers
- R&D Project Coordinators
- Digital Transformation Specialists
- UX Researchers
- Technology Architects

**Standard roles:**
- Project Managers
- Business Analysts
- Software Developers
- System Administrators
- Change Management Specialists

### 2. TECHNOLOGY REQUIREMENTS (8-12 items)
For EACH, provide (bilingual):
- name_en / name_ar: Technology/system name
- quantity: Licenses, units, or capacity
- cost: Total cost in SAR
- notes_en / notes_ar: Vendor, integration needs

**MUST include Innovation/R&D tech:**
- AI/ML Development Platform (Azure ML, AWS SageMaker, Google Vertex)
- Data Analytics Platform (Power BI, Tableau, custom dashboards)
- IoT Platform & Sensors (for smart city pilots)
- Digital Twin Software (for urban simulation)
- Innovation Management System (idea tracking, portfolio)
- Collaboration Tools (for R&D partnerships)
- API Management Platform (for Balady integration)
- Cloud Infrastructure (for AI workloads)

**Standard tech:**
- Enterprise Software Licenses
- Hardware & Devices
- Network Infrastructure
- Security Solutions

### 3. INFRASTRUCTURE REQUIREMENTS (4-8 items)
For EACH, provide (bilingual):
- name_en / name_ar: Infrastructure item
- quantity: Size/capacity
- cost: Capital cost in SAR
- notes_en / notes_ar: Location, timeline

**MUST include Innovation infrastructure:**
- Innovation Lab / Testbed Facility
- Data Center Capacity (for AI/analytics)
- IoT Network Infrastructure (LoRaWAN, 5G)
- Smart City Command Center
- Collaboration Space for R&D teams

**Standard infrastructure:**
- Office Space
- Training Facilities
- Equipment & Vehicles

### 4. BUDGET ALLOCATION (6-10 line items)
For EACH, provide (bilingual):
- name_en / name_ar: Budget category
- quantity: "1" (or number of years)
- cost: Total allocation in SAR
- notes_en / notes_ar: Breakdown, conditions

**MUST include Innovation budget:**
- R&D Investment Fund (3-5% of total budget)
- Innovation Pilots Budget
- Research Partnership Funding (KACST, universities)
- Technology POC Budget
- Innovation Training & Certifications
- Startup/VC Co-investment Fund

**Standard budget:**
- Personnel Costs
- Technology & Licenses
- Infrastructure & Capital
- Operations & Maintenance
- Contingency Reserve (10-15%)

---

## INNOVATION RESOURCE EXAMPLES:

**HR - Innovation Team:**
- "Chief Innovation Officer" - SAR 600,000/year - Lead innovation strategy
- "AI/ML Engineer (SDAIA Certified)" - SAR 400,000/year - 3 needed for ML projects
- "Smart City Solutions Architect" - SAR 450,000/year - IoT & digital twin expertise

**Technology - R&D Platforms:**
- "Azure AI + ML Studio" - SAR 500,000/year - Cloud AI development
- "Innovation Portfolio Management System" - SAR 200,000 - Track pilots & R&D
- "IoT Platform (ThingsBoard/Azure IoT)" - SAR 300,000/year - Smart city sensors

**Infrastructure - Innovation Spaces:**
- "Municipal Innovation Lab" - SAR 2,000,000 - Testbed facility in Riyadh
- "Smart City Command Center" - SAR 5,000,000 - Urban operations center

**Budget - R&D Allocation:**
- "Annual R&D Fund" - SAR 10,000,000/year - Innovation pilots and research
- "KACST Partnership Fund" - SAR 3,000,000 - Co-funded research projects
- "GovTech Accelerator Investment" - SAR 2,000,000 - Startup collaborations

---

## DISTRIBUTION REQUIREMENTS:
- At least 25% of HR should be innovation/tech roles
- At least 30% of technology budget for R&D platforms
- Explicit R&D budget line (3-5% of total)
- Saudization compliance for all positions

Be specific. Use realistic Saudi salary benchmarks and vendor pricing.`,
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

Assess readiness, define change approach, and resistance management strategies.`,
      dependencies: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Major Cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Tabuk, Abha
- Vision 2030 Alignment: Quality of Life Program, Housing Program (70% ownership), National Transformation Program
- Innovation Priorities: AI/ML, IoT, Digital Twins, Blockchain, Smart City Technologies, GovTech, PropTech, CleanTech
- Key Frameworks: National Spatial Strategy, National Housing Strategy, Smart City National Framework
- Key Systems: Balady Platform, Sakani Housing Program, Momra Services, Baladiya Systems
- Sister Ministries: MCIT, MHRSD, MOT, MODON, Royal Commission

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).slice(0, 5).map(s => `- ${s.name_en || s.name_ar} (${s.type})`).join('\n') || 'Not defined yet'}

## IDENTIFIED RISKS (from Step 7):
${(wizardData.risks || []).slice(0, 5).map(r => `- ${r.title_en || r.title_ar} (${r.category})`).join('\n') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate THREE types of items: dependencies, constraints, and assumptions.

---

### PART 1: DEPENDENCIES (8-12 items)

For EACH dependency, provide ALL fields in BOTH English and Arabic:
- name_en / name_ar: Short dependency name (5-10 words)
- type: One of "internal" | "external" | "technical" | "resource"
- source: Where/who the dependency comes from (department, system, stakeholder)
- target: What/who depends on it (initiative, objective, system)
- criticality: "low" | "medium" | "high"

**DEPENDENCY TYPE DISTRIBUTION:**
- internal: 2-3 (cross-department coordination, Amanat approvals, municipal council decisions)
- external: 2-3 (MCIT, MOMRA, SDAIA, third-party vendors, Vision Realization Programs)
- technical: 2-3 (Balady integration, GIS platforms, IoT infrastructure, National Data Governance)
- resource: 2-3 (budget from MOF, specialized staff, Saudization requirements)

**MoMAH-SPECIFIC DEPENDENCY EXAMPLES:**
- INTERNAL: "Amanat Finance Directorate Budget Cycle Approval" - Source: Finance → Target: All capital projects
- EXTERNAL: "SDAIA AI Governance Compliance Certification" - Source: SDAIA → Target: AI-powered services
- EXTERNAL: "Vision 2030 VRP Milestone Alignment" - Source: Vision Realization Office → Target: Strategic initiatives
- TECHNICAL: "Balady National Platform API Integration" - Source: Balady System → Target: E-services
- TECHNICAL: "National Address System (ANSA) Integration" - Source: Saudi Post → Target: Service delivery
- RESOURCE: "MCIT Digital Capacity Building Program Support" - Source: MCIT → Target: Staff training

---

### PART 2: CONSTRAINTS (6-8 items)

For EACH constraint, provide ALL fields in BOTH English and Arabic:
- description_en / description_ar: Clear description of the limitation (1-2 sentences)
- type: One of "budget" | "time" | "resource" | "regulatory" | "technical"
- impact: "low" | "medium" | "high"
- mitigation_en / mitigation_ar: How to work within this constraint (1-2 sentences)

**CONSTRAINT TYPE DISTRIBUTION:**
- budget: 1-2 (MOF allocation cycles, municipal revenue limits, SAR procurement thresholds)
- time: 1-2 (Vision 2030 milestones 2025/2030, NTP deadlines, Quality of Life targets)
- resource: 1-2 (Saudization requirements, skill gaps in emerging tech, MCIT certification needs)
- regulatory: 1-2 (PDPL data protection, CITC telecom regulations, MOMRA building codes)
- technical: 1-2 (legacy Baladiya systems, interoperability with national platforms)

**MoMAH-SPECIFIC CONSTRAINT EXAMPLES:**
- BUDGET: "Annual CAPEX allocation limited by MOF fiscal year cycle and SAR ${wizardData.budget_range || '50M'} ceiling"
- TIME: "All smart city initiatives must demonstrate measurable outcomes by Vision 2030 interim review (2025)"
- REGULATORY: "Digital services must comply with PDPL and SDAIA AI Ethics Principles"
- REGULATORY: "Construction permits must align with updated Saudi Building Code (SBC) requirements"
- TECHNICAL: "Must maintain backward compatibility with existing Balady and Momra legacy systems"
- RESOURCE: "Saudization quota of 70%+ for technical positions per MHRSD requirements"

---

### PART 3: ASSUMPTIONS (6-10 items)

For EACH assumption, provide ALL fields in BOTH English and Arabic:
- statement_en / statement_ar: Clear assumption statement (1 sentence starting with "We assume that...")
- category: One of "operational" | "financial" | "market" | "stakeholder" | "regulatory"
- confidence: "low" | "medium" | "high"
- validation_method_en / validation_method_ar: How to verify this assumption (1 sentence)

**ASSUMPTION CATEGORY DISTRIBUTION:**
- operational: 2-3 (Amanat capacity, municipal staff capabilities, inter-department coordination)
- financial: 1-2 (MOF allocations, Vision Realization Program funding, PPP viability)
- market: 1-2 (citizen digital adoption, private sector participation, technology maturity)
- stakeholder: 1-2 (Royal Court support, ministry coordination, citizen engagement)
- regulatory: 1-2 (policy continuity, regulatory sandbox availability, compliance timelines)

**MoMAH-SPECIFIC ASSUMPTION EXAMPLES:**
- OPERATIONAL: "We assume that Amanat staff can achieve MCIT digital competency certification within 12 months"
- FINANCIAL: "We assume that Vision Realization Program funding will continue through 2030"
- FINANCIAL: "We assume that PPP models will be approved for smart city infrastructure projects"
- MARKET: "We assume that citizen adoption of e-municipal services will reach 80% by 2027"
- STAKEHOLDER: "We assume that SDAIA will provide technical support for AI implementation"
- REGULATORY: "We assume that CITC will approve 5G spectrum allocation for municipal IoT by Q2 2025"

---

Be highly specific to MoMAH's mandate, Vision 2030 alignment, and the Saudi municipal ecosystem. Reference actual systems (Balady, Sakani, ANSA), agencies (SDAIA, MCIT, MOMRA), and frameworks. Avoid generic corporate language.`,
      objectives: `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
MoMAH oversees municipal services across 13 administrative regions, 285+ municipalities, and 17 major Amanats.
- Major Cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Tabuk, Abha
- Vision 2030 Programs: Quality of Life Program, Housing Program (70% ownership target), National Transformation Program, Thriving Cities Program
- Innovation Priorities: AI/ML, IoT, Digital Twins, Blockchain, Smart City Technologies, GovTech, PropTech, CleanTech
- Key Frameworks: National Spatial Strategy (NSS), National Housing Strategy, Smart City National Framework, Municipal Excellence Framework
- Key Systems: Balady Platform, Sakani Housing Program, Momra Services, Baladiya Systems, ANSA (National Address)
- Sister Agencies: MCIT, MHRSD, MOT, MODON, Royal Commission, SDAIA, STC, CITC

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}${context.planNameAr ? ` (${context.planNameAr})` : ''}
- Vision: ${context.vision || 'Not yet defined'}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ') || 'Not specified'}
- Strategic Themes: ${(wizardData.strategic_themes || []).join(', ') || 'Not specified'}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Vision 2030 Programs: ${(wizardData.vision_2030_programs || []).join(', ') || 'Not specified'}
- Target Regions: ${(wizardData.target_regions || []).join(', ') || 'Kingdom-wide'}

## STRATEGIC PILLARS (from Step 2):
${(wizardData.strategic_pillars || []).map((p, i) => `${i + 1}. ${p.name_en || p.name_ar}`).join('\n') || 'Not defined yet'}

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).filter(s => s.power === 'high').slice(0, 5).map(s => `- ${s.name_en || s.name_ar} (${s.type})`).join('\n') || 'Not defined yet'}

## SWOT SUMMARY (from Step 5):
- Key Strengths: ${(wizardData.swot?.strengths || []).filter(s => s.priority === 'high').slice(0, 2).map(s => s.text_en).join('; ') || 'Not analyzed yet'}
- Key Opportunities: ${(wizardData.swot?.opportunities || []).filter(o => o.priority === 'high').slice(0, 2).map(o => o.text_en).join('; ') || 'Not analyzed yet'}
- Key Challenges: ${(wizardData.swot?.weaknesses || []).filter(w => w.priority === 'high').slice(0, 2).map(w => w.text_en).join('; ') || 'Not analyzed yet'}

## KEY RISKS (from Step 7):
${(wizardData.risks || []).filter(r => r.impact === 'high' || r.likelihood === 'high').slice(0, 3).map(r => `- ${r.title_en || r.title_ar} (${r.category})`).join('\n') || 'Not assessed yet'}

## DISCOVERY INPUTS (from Step 1):
- Key Challenges: ${wizardData.key_challenges_en || 'Not specified'}
- Available Resources: ${wizardData.available_resources_en || 'Not specified'}
- Initial Constraints: ${wizardData.initial_constraints_en || 'Not specified'}

---

## REQUIREMENTS:
Generate 6-10 Strategic Objectives for this municipal strategic plan.

Each objective MUST have ALL fields in BOTH English and Arabic:
- name_en / name_ar: Clear, action-oriented objective title (5-12 words)
- description_en / description_ar: Detailed description explaining the objective's scope, expected outcomes, and alignment (3-5 sentences)
- sector_code: One of the target sectors (${context.sectors.join(' | ') || 'URBAN_PLANNING | HOUSING | INFRASTRUCTURE | ENVIRONMENT | SMART_CITIES | DIGITAL_SERVICES | CITIZEN_SERVICES | RURAL_DEVELOPMENT | PUBLIC_SPACES | WATER_RESOURCES | TRANSPORTATION | HERITAGE'})
- priority: "high" | "medium" | "low"

---

## OBJECTIVE DESIGN PRINCIPLES:

**1. SMART Criteria:**
- Specific: Clear scope and boundaries
- Measurable: Quantifiable outcomes possible
- Achievable: Realistic within budget and timeline
- Relevant: Aligned with Vision 2030 and MoMAH mandate
- Time-bound: Achievable within ${context.endYear - context.startYear} years

**2. Alignment Requirements:**
- Each objective MUST directly support at least one Strategic Pillar
- Each objective MUST align with at least one Vision 2030 program
- Objectives MUST collectively address the key challenges identified
- Objectives MUST leverage the focus technologies where relevant

**3. Distribution Requirements:**
- At least 2-3 objectives should be HIGH priority
- At least 2 objectives should be MEDIUM priority
- Maximum 1-2 objectives LOW priority
- Cover at least 4 different target sectors
- Balance between operational excellence and transformation goals

---

## MoMAH-SPECIFIC OBJECTIVE EXAMPLES:

**Digital Transformation & Smart Cities:**
- "Implement Integrated Smart City Command Center" - Deploy IoT-based urban management platform across major cities
- "Achieve 95% Digital Service Adoption" - Migrate all municipal services to Balady digital platform
- "Deploy AI-Powered Municipal Decision Support" - Implement SDAIA-compliant AI for urban planning

**Citizen Experience:**
- "Enhance Municipal Service Satisfaction to 85%+" - Improve citizen-facing services across all Amanats
- "Reduce Service Delivery Time by 50%" - Streamline permit and approval processes

**Infrastructure & Urban Development:**
- "Develop 50,000 Housing Units" - Support Sakani program housing targets in target regions
- "Achieve 100% ANSA Coverage" - Complete National Address integration for all properties
- "Upgrade Municipal Infrastructure in 5 Cities" - Modernize water, sewage, and roads

**Sustainability & Environment:**
- "Reduce Municipal Carbon Footprint by 30%" - Align with Saudi Green Initiative targets
- "Achieve Zero-Waste for 3 Major Cities" - Implement comprehensive waste management

**Governance & Capacity:**
- "Build Digital Competency Across 80% of Staff" - MCIT-certified training program
- "Establish Regional Innovation Hubs in 5 Regions" - Foster municipal innovation ecosystem

---

## CRITICAL GUIDELINES:

1. **Use Formal Arabic (فصحى)** for all Arabic content - appropriate for government documents
2. **Be Specific to Plan Context** - Reference the actual sectors, technologies, and programs selected
3. **Avoid Generic Language** - No vague objectives like "improve efficiency" without specifics
4. **Include Measurable Elements** - Even in descriptions, hint at how success will be measured
5. **Consider Dependencies** - Objectives should be achievable given the constraints identified
6. **Balance Ambition and Realism** - Stretch goals but achievable within timeline and budget

Return objectives as an array under the "objectives" key.`
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
          best_case: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'number' } } },
          worst_case: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'number' } } },
          most_likely: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'number' } } }
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
          const parseProbability = (value, fallback) => {
            if (typeof value === 'number' && Number.isFinite(value)) {
              return Math.max(0, Math.min(100, value));
            }
            if (typeof value === 'string') {
              const n = Number(value.replace('%', '').trim());
              if (Number.isFinite(n)) return Math.max(0, Math.min(100, n));
            }
            return fallback;
          };

          const mapScenario = (scenario, fallbackProbability) => ({
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
            probability: parseProbability(scenario?.probability, fallbackProbability)
          });

          updates.scenarios = {
            best_case: mapScenario(data.best_case, 20),
            worst_case: mapScenario(data.worst_case, 20),
            most_likely: mapScenario(data.most_likely, 60)
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
