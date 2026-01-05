import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useLanguage } from '@/components/LanguageContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { usePilotMutations } from '@/hooks/usePilotMutations';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useLocations } from '@/hooks/useLocations';
import { useSandboxes } from '@/hooks/useSandboxes';

// Import Step Components
import Step1Setup from '@/components/pilots/create/Step1Setup';
import Step2Design from '@/components/pilots/create/Step2Design';
import Step3Data from '@/components/pilots/create/Step3Data';
import Step4Sandbox from '@/components/pilots/create/Step4Sandbox';
import Step5Timeline from '@/components/pilots/create/Step5Timeline';
import Step6Budget from '@/components/pilots/create/Step6Budget';
import Step7Review from '@/components/pilots/create/Step7Review';

export default function PilotCreatePage() {
  const { hasPermission } = usePermissions();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const { language, isRTL, t } = useLanguage();
  const { triggerEmail } = useEmailTrigger();
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Initial Form Data
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    challenge_id: '',
    solution_id: '',
    municipality_id: '',
    region_id: '',
    city_id: '',
    sector: '',
    sub_sector: '',
    status: 'draft',
    budget: '',
    budget_currency: 'SAR',
    start_date: '',
    duration_weeks: '',
    end_date: '',
    risk_level: 'medium',
    trl_level: '',

    // Arrays / Objects
    kpis: [],
    milestones: [],
    team_members: [],
    stakeholders: [],
    technology_stack: [],
    safety_protocols: [],
    budget_breakdown: [],
    funding_sources: [],
    documents: [],
    gallery_urls: [],
    video_url: '',
    image_url: '',
    tags: [],

    // Flags
    is_published: false,
    is_flagship: false,
    is_archived: false,

    // Sandbox
    sandbox_id: '',
    sandbox_zone: '',
    regulatory_exemptions: []
  });

  // --- Data Fetching ---
  const { data: challenges = [] } = useChallengesWithVisibility({ limit: 1000 });
  const { data: solutions = [] } = useSolutionsWithVisibility({ limit: 1000 });
  const { useAllMunicipalities, useAllRegions, useAllCities } = useLocations();
  const { data: municipalities = [] } = useAllMunicipalities();
  const { data: regions = [] } = useAllRegions();
  const { data: cities = [] } = useAllCities();
  const { data: sandboxes = [] } = useSandboxes();
  
  // Readiness check state for Step 1
  const [readinessChecked, setReadinessChecked] = useState(false);
  const [selectedSolutionForCheck, setSelectedSolutionForCheck] = useState(null);
  
  // Filter solutions based on selected challenge
  const filteredSolutions = formData.challenge_id 
    ? solutions.filter(s => s.challenge_ids?.includes(formData.challenge_id) || s.matched_challenge_ids?.includes(formData.challenge_id))
    : solutions;
  
  // Filter sandboxes based on selected municipality
  const filteredSandboxes = formData.municipality_id
    ? sandboxes.filter(s => s.municipality_id === formData.municipality_id || !s.municipality_id)
    : sandboxes;
    
  // Sector options
  const sectorOptions = [
    { value: 'infrastructure', label: 'Infrastructure', label_ar: 'البنية التحتية' },
    { value: 'transportation', label: 'Transportation', label_ar: 'النقل' },
    { value: 'environment', label: 'Environment', label_ar: 'البيئة' },
    { value: 'health', label: 'Health', label_ar: 'الصحة' },
    { value: 'education', label: 'Education', label_ar: 'التعليم' },
    { value: 'safety', label: 'Safety & Security', label_ar: 'الأمن والسلامة' },
    { value: 'economy', label: 'Economy', label_ar: 'الاقتصاد' },
    { value: 'social', label: 'Social Services', label_ar: 'الخدمات الاجتماعية' },
    { value: 'digital', label: 'Digital Services', label_ar: 'الخدمات الرقمية' },
    { value: 'tourism', label: 'Tourism & Culture', label_ar: 'السياحة والثقافة' },
  ];
  
  // Living labs placeholder (add hook later if needed)
  const livingLabs = [];
  
  // AI Suggestions handler
  const handleAISuggestions = async () => {
    if (!formData.challenge_id || !formData.solution_id) {
      toast.error(t({ en: 'Select challenge and solution first', ar: 'اختر التحدي والحل أولاً' }));
      return;
    }
    
    const challenge = challenges.find(c => c.id === formData.challenge_id);
    const solution = solutions.find(s => s.id === formData.solution_id);
    
    try {
      const result = await invokeAI({
        prompt: `Design a municipal pilot for:
Challenge: ${challenge?.title_en}
Solution: ${solution?.name_en}
Sector: ${formData.sector}

Generate pilot design with:
1. Title (EN/AR)
2. Description (EN/AR)
3. 5 KPIs with baseline/target
4. Timeline recommendation
5. Budget estimate`,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            kpis: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, baseline: { type: 'string' }, target: { type: 'string' }, unit: { type: 'string' } } } },
            duration_weeks: { type: 'number' },
            budget_estimate: { type: 'number' }
          }
        }
      });
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          title_en: result.data.title_en || prev.title_en,
          title_ar: result.data.title_ar || prev.title_ar,
          description_en: result.data.description_en || prev.description_en,
          description_ar: result.data.description_ar || prev.description_ar,
          kpis: result.data.kpis || prev.kpis,
          duration_weeks: result.data.duration_weeks || prev.duration_weeks,
          budget: result.data.budget_estimate || prev.budget
        }));
        toast.success(t({ en: 'AI suggestions applied!', ar: 'تم تطبيق اقتراحات الذكاء الاصطناعي!' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate suggestions', ar: 'فشل إنشاء الاقتراحات' }));
    }
  };

  // --- Mutation ---
  const { createPilot } = usePilotMutations();


  // --- Navigation & Actions ---
  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep(prev => Math.min(prev + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = (currentStep) => {
    // Basic validation
    if (currentStep === 1) {
      if (!formData.challenge_id || !formData.solution_id) {
        toast.error(t({ en: 'Please select a challenge and solution', ar: 'يرجى اختيار تحدي وحل' }));
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.title_en) {
        toast.error(t({ en: 'Title is required', ar: 'العنوان مطلوب' }));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    // Clean Data before passing to hook
    const cleanData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : 0,
      target_population_size: formData.target_population_size ? parseInt(formData.target_population_size) : 0,
    };

    createPilot.mutate(cleanData, {
      onSuccess: (data) => {
        navigate(`/pilots/${data.id}`);
      }
    });
  };

  if (!hasPermission('pilot_create')) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
          <Shield className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-600 mt-2">You do not have permission to create pilots.</p>
          <Button className="mt-6" onClick={() => navigate('/pilots')}>
            Back to Pilots
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Steps Configuration
  const steps = [
    { title: 'Setup', icon: '1' },
    { title: 'Design', icon: '2' },
    { title: 'Data', icon: '3' },
    { title: 'Sandbox', icon: '4' },
    { title: 'Timeline', icon: '5' },
    { title: 'Budget', icon: '6' },
    { title: 'Review', icon: '7' }
  ];

  return (
    <PageLayout className="max-w-5xl mx-auto pb-20">
      <PageHeader
        title={t({ en: 'Create New Pilot', ar: 'إنشاء تجربة جديدة' })}
        breadcrumbItems={[
          { label: 'Pilots', href: '/pilots' },
          { label: 'Create', active: true }
        ]}
      />

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="relative flex justify-between">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -transla-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary/20 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => stepNum < step && setStep(stepNum)}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 
                    ${isActive ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg' :
                      isCompleted ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : s.icon}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-10 min-h-[500px]">
        {step === 1 && (
          <Step1Setup
            formData={formData}
            setFormData={setFormData}
            challenges={challenges}
            solutions={solutions}
            municipalities={municipalities}
            regions={regions}
            cities={cities}
            livingLabs={livingLabs}
            sectorOptions={sectorOptions}
            filteredSolutions={filteredSolutions}
            readinessChecked={readinessChecked}
            setReadinessChecked={setReadinessChecked}
            selectedSolutionForCheck={selectedSolutionForCheck}
            setSelectedSolutionForCheck={setSelectedSolutionForCheck}
            handleAISuggestions={handleAISuggestions}
            isAIProcessing={isAIProcessing}
            t={t}
            language={language}
          />
        )}
        {step === 2 && (
          <Step2Design
            formData={formData}
            setFormData={setFormData}
            invokeAI={invokeAI}
            isAIProcessing={isAIProcessing}
            t={t}
          />
        )}
        {step === 3 && (
          <Step3Data
            formData={formData}
            setFormData={setFormData}
            invokeAI={invokeAI}
            isAIProcessing={isAIProcessing}
            challenges={challenges}
            solutions={solutions}
            t={t}
            language={language}
          />
        )}
        {step === 4 && (
          <Step4Sandbox
            formData={formData}
            setFormData={setFormData}
            sandboxes={sandboxes}
            filteredSandboxes={filteredSandboxes}
            invokeAI={invokeAI}
            isAIProcessing={isAIProcessing}
            challenges={challenges}
            solutions={solutions}
            t={t}
            language={language}
          />
        )}
        {step === 5 && (
          <Step5Timeline
            formData={formData}
            setFormData={setFormData}
            invokeAI={invokeAI}
            isAIProcessing={isAIProcessing}
            challenges={challenges}
            solutions={solutions}
            t={t}
          />
        )}
        {step === 6 && (
          <Step6Budget
            formData={formData}
            setFormData={setFormData}
            invokeAI={invokeAI}
            isAIProcessing={isAIProcessing}
            t={t}
          />
        )}
        {step === 7 && (
          <Step7Review
            formData={formData}
            t={t}
            language={language}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50 flex justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-5xl flex justify-between items-center px-4 md:px-0">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="w-32"
          >
            {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
            {t({ en: 'Previous', ar: 'السابق' })}
          </Button>

          <div className="flex gap-4">
            {/* Save Draft Button (Optional - could add later) */}
          </div>

          {step < 7 ? (
            <Button
              onClick={nextStep}
              className="w-32"
              disabled={isAIProcessing}
            >
              {t({ en: 'Next', ar: 'التالي' })}
              {isRTL ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="w-40 bg-green-600 hover:bg-green-700 text-white"
              disabled={createPilot.isPending}
            >
              {createPilot.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Create Pilot', ar: 'إنشاء التجربة' })}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
