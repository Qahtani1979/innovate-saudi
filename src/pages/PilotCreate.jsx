import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
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
    regulatory_exemptions: ''
  });

  // --- Data Fetching ---
  const { data: challenges = [] } = useChallengesWithVisibility({ limit: 1000 });
  const { data: solutions = [] } = useSolutionsWithVisibility({ limit: 1000 });
  const { useAllMunicipalities } = useLocations();
  const { data: municipalities = [] } = useAllMunicipalities();
  const { data: sandboxes = [] } = useSandboxes();

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

  if (!hasPermission('create_pilot')) {
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
            t={t}
            language={language}
          />
        )}
        {step === 4 && (
          <Step4Sandbox
            formData={formData}
            setFormData={setFormData}
            sandboxes={sandboxes}
            invokeAI={invokeAI}
            isAIProcessing={isAIProcessing}
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