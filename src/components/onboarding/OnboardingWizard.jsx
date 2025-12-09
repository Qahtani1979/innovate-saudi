import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import FileUploader from '../FileUploader';
import useOnboardingAnalytics from '@/hooks/useOnboardingAnalytics';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, 
  Building2, Lightbulb, FlaskConical, Users, Eye,
  Rocket, Target, BookOpen, Network, X, Loader2,
  User, Briefcase, GraduationCap, Wand2, RefreshCw,
  Upload, FileText, Linkedin, Globe
} from 'lucide-react';
import { toast } from 'sonner';

// Send welcome email via edge function
const sendWelcomeEmail = async (userId, userEmail, userName, persona, language) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { userId, userEmail, userName, persona, language }
    });
    if (error) console.warn('Welcome email failed:', error);
    else console.log('Welcome email sent:', data);
  } catch (err) {
    console.warn('Failed to send welcome email:', err);
  }
};

const PERSONAS = [
  {
    id: 'municipality_staff',
    icon: Building2,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: { en: 'Municipality Staff', ar: 'موظف بلدية' },
    description: { en: 'I work at a municipality and want to solve urban challenges', ar: 'أعمل في بلدية وأريد حل التحديات الحضرية' },
    landingPage: 'MunicipalityDashboard'
  },
  {
    id: 'provider',
    icon: Rocket,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: { en: 'Solution Provider / Startup', ar: 'مزود حلول / شركة ناشئة' },
    description: { en: 'I have solutions to offer and want to find opportunities', ar: 'لدي حلول أريد تقديمها وأبحث عن فرص' },
    landingPage: 'ProviderDashboard'
  },
  {
    id: 'researcher',
    icon: FlaskConical,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: { en: 'Researcher / Academic', ar: 'باحث / أكاديمي' },
    description: { en: 'I conduct R&D and want to collaborate with municipalities', ar: 'أقوم بالبحث والتطوير وأريد التعاون مع البلديات' },
    landingPage: 'ResearcherDashboard'
  },
  {
    id: 'citizen',
    icon: Users,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: { en: 'Citizen / Community Member', ar: 'مواطن / عضو مجتمع' },
    description: { en: 'I want to contribute ideas and participate in pilots', ar: 'أريد المساهمة بأفكار والمشاركة في التجارب' },
    landingPage: 'CitizenDashboard'
  },
  {
    id: 'viewer',
    icon: Eye,
    color: 'from-slate-500 to-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    title: { en: 'Explorer / Observer', ar: 'مستكشف / مراقب' },
    description: { en: 'I want to explore and learn about innovation initiatives', ar: 'أريد استكشاف ومعرفة المزيد عن مبادرات الابتكار' },
    landingPage: 'Home'
  }
];

const EXPERTISE_OPTIONS = [
  { en: 'Urban Planning', ar: 'التخطيط الحضري' },
  { en: 'Smart City', ar: 'المدن الذكية' },
  { en: 'Sustainability', ar: 'الاستدامة' },
  { en: 'Transportation', ar: 'النقل' },
  { en: 'Public Services', ar: 'الخدمات العامة' },
  { en: 'AI & Technology', ar: 'الذكاء الاصطناعي والتقنية' },
  { en: 'Energy', ar: 'الطاقة' },
  { en: 'Healthcare', ar: 'الرعاية الصحية' },
  { en: 'Education', ar: 'التعليم' },
  { en: 'Environment', ar: 'البيئة' },
];

const STEPS = [
  { id: 1, title: { en: 'Welcome', ar: 'مرحباً' }, icon: Sparkles },
  { id: 2, title: { en: 'Import', ar: 'استيراد' }, icon: Upload },
  { id: 3, title: { en: 'Profile', ar: 'الملف' }, icon: User },
  { id: 4, title: { en: 'AI Assist', ar: 'مساعد ذكي' }, icon: Wand2 },
  { id: 5, title: { en: 'Role', ar: 'الدور' }, icon: Briefcase },
  { id: 6, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

export default function OnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const { user, userProfile, checkAuth, userRoles } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  const [isExtractingLinkedIn, setIsExtractingLinkedIn] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    department: '',
    bio: '',
    organization: '',
    selectedPersona: null,
    expertise_areas: [],
    interests: [],
    requestRole: false,
    roleJustification: '',
    cv_url: '',
    linkedin_url: '',
    years_of_experience: 0,
    work_phone: ''
  });

  // Initialize form data from existing profile
  useEffect(() => {
    if (userProfile || user) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        job_title: userProfile?.job_title || '',
        department: userProfile?.department || '',
        bio: userProfile?.bio || userProfile?.bio_en || '',
        organization: userProfile?.organization || '',
        expertise_areas: userProfile?.expertise_areas || [],
        interests: userProfile?.interests || [],
        linkedin_url: userProfile?.linkedin_url || '',
        cv_url: userProfile?.cv_url || '',
      }));
    }
  }, [userProfile, user]);

  const progress = (currentStep / STEPS.length) * 100;
  const selectedPersona = PERSONAS.find(p => p.id === formData.selectedPersona);

  const calculateProfileCompletion = (data) => {
    let score = 0;
    if (data.full_name) score += 20;
    if (data.job_title) score += 15;
    if (data.bio) score += 15;
    if (data.selectedPersona) score += 20;
    if (data.expertise_areas?.length > 0) score += 15;
    if (data.cv_url || data.linkedin_url) score += 15;
    return Math.min(score, 100);
  };

  // Get role-based landing page
  const getLandingPage = () => {
    if (userRoles?.length > 0) {
      const role = userRoles[0]?.role;
      if (role === 'admin') return 'AdminDashboard';
      if (role === 'municipality_admin' || role === 'municipality_staff') return 'MunicipalityDashboard';
      if (role === 'provider') return 'ProviderDashboard';
      if (role === 'researcher') return 'ResearcherDashboard';
      if (role === 'citizen') return 'CitizenDashboard';
    }
    if (selectedPersona) {
      return selectedPersona.landingPage;
    }
    return 'Home';
  };

  // Handle CV upload and extraction
  const handleCVUpload = async (fileUrl) => {
    if (!fileUrl) {
      setFormData(prev => ({ ...prev, cv_url: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, cv_url: fileUrl }));
    setIsExtractingCV(true);

    try {
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            job_title: { type: 'string' },
            organization: { type: 'string' },
            department: { type: 'string' },
            years_of_experience: { type: 'number' },
            expertise_areas: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            linkedin_url: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      });

      if (extracted.status === 'success' && extracted.output) {
        const output = extracted.output;
        setFormData(prev => ({
          ...prev,
          full_name: output.full_name || prev.full_name,
          job_title: output.job_title || prev.job_title,
          organization: output.organization || prev.organization,
          department: output.department || prev.department,
          years_of_experience: output.years_of_experience || prev.years_of_experience,
          expertise_areas: output.expertise_areas?.length > 0 ? output.expertise_areas : prev.expertise_areas,
          bio: output.bio || prev.bio,
          linkedin_url: output.linkedin_url || prev.linkedin_url,
          work_phone: output.phone || prev.work_phone
        }));
        toast.success(t({ en: 'CV data extracted successfully!', ar: 'تم استخراج بيانات السيرة الذاتية بنجاح!' }));
      }
    } catch (error) {
      console.error('CV extraction error:', error);
      toast.error(t({ en: 'Could not extract CV data automatically', ar: 'تعذر استخراج بيانات السيرة الذاتية تلقائياً' }));
    } finally {
      setIsExtractingCV(false);
    }
  };

  // Handle LinkedIn URL import
  const handleLinkedInImport = async () => {
    if (!formData.linkedin_url) {
      toast.error(t({ en: 'Please enter your LinkedIn profile URL', ar: 'يرجى إدخال رابط ملفك الشخصي على LinkedIn' }));
      return;
    }

    setIsExtractingLinkedIn(true);

    try {
      // Use AI to suggest profile based on LinkedIn URL pattern
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this LinkedIn profile URL: ${formData.linkedin_url}
        
Extract or infer the following information. If the URL contains a username or name pattern, try to suggest professional details:

1. Likely professional title/role
2. Likely industry or expertise areas
3. Suggested bio for a municipal innovation platform

Return a JSON with these fields.`,
        response_json_schema: {
          type: 'object',
          properties: {
            likely_title: { type: 'string' },
            expertise_areas: { type: 'array', items: { type: 'string' } },
            suggested_bio: { type: 'string' }
          }
        }
      });

      if (result) {
        setFormData(prev => ({
          ...prev,
          job_title: result.likely_title || prev.job_title,
          expertise_areas: result.expertise_areas?.length > 0 
            ? [...new Set([...prev.expertise_areas, ...result.expertise_areas])].slice(0, 5)
            : prev.expertise_areas,
          bio: result.suggested_bio || prev.bio
        }));
        toast.success(t({ en: 'LinkedIn profile analyzed!', ar: 'تم تحليل ملف LinkedIn!' }));
      }
    } catch (error) {
      console.error('LinkedIn import error:', error);
      toast.info(t({ en: 'LinkedIn URL saved. Please fill in details manually.', ar: 'تم حفظ رابط LinkedIn. يرجى إدخال التفاصيل يدوياً.' }));
    } finally {
      setIsExtractingLinkedIn(false);
    }
  };

  // AI-powered profile suggestions
  const generateAISuggestions = async () => {
    if (!formData.full_name && !formData.job_title && !formData.bio) {
      toast.error(t({ en: 'Please fill in some profile information first', ar: 'يرجى ملء بعض معلومات الملف الشخصي أولاً' }));
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user profile and provide personalized suggestions to improve their Saudi Innovates platform experience. PROVIDE ALL TEXT IN BOTH ENGLISH AND ARABIC.

User Profile:
- Name: ${formData.full_name || 'Not provided'}
- Job Title: ${formData.job_title || 'Not provided'}
- Organization: ${formData.organization || 'Not provided'}
- Department: ${formData.department || 'Not provided'}
- Bio: ${formData.bio || 'Not provided'}
- Years of Experience: ${formData.years_of_experience || 'Not provided'}
- LinkedIn: ${formData.linkedin_url || 'Not provided'}
- Has CV: ${formData.cv_url ? 'Yes' : 'No'}
- Current Expertise: ${formData.expertise_areas?.join(', ') || 'Not provided'}

Based on this information:
1. Suggest an improved bio that highlights their expertise (keep it concise, 2-3 sentences)
2. Recommend the most suitable persona/role for this user
3. Suggest relevant expertise areas from: Urban Planning, Smart City, Sustainability, Transportation, Public Services, AI & Technology, Energy, Healthcare, Education, Environment
4. Provide personalized tips for getting started on the platform`,
        response_json_schema: {
          type: 'object',
          properties: {
            improved_bio_en: { type: 'string' },
            improved_bio_ar: { type: 'string' },
            recommended_persona: { type: 'string', enum: ['municipality_staff', 'provider', 'researcher', 'citizen', 'viewer'] },
            persona_reason_en: { type: 'string' },
            persona_reason_ar: { type: 'string' },
            suggested_expertise: { type: 'array', items: { type: 'string' } },
            getting_started_tips_en: { type: 'array', items: { type: 'string' } },
            getting_started_tips_ar: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      setAiSuggestions(result);
      toast.success(t({ en: 'AI suggestions generated!', ar: 'تم إنشاء الاقتراحات الذكية!' }));
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t({ en: 'Failed to generate suggestions', ar: 'فشل في إنشاء الاقتراحات' }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestion = (field, value) => {
    if (field === 'bio') {
      setFormData(prev => ({ ...prev, bio: value }));
    } else if (field === 'persona') {
      setFormData(prev => ({ ...prev, selectedPersona: value }));
    } else if (field === 'expertise') {
      setFormData(prev => ({ ...prev, expertise_areas: value }));
    }
    toast.success(t({ en: 'Applied!', ar: 'تم التطبيق!' }));
  };

  // Check if specialized wizard is needed
  const needsSpecializedWizard = (persona) => {
    return ['municipality_staff', 'provider', 'researcher', 'citizen', 'expert'].includes(persona);
  };

  // Get specialized wizard page
  const getSpecializedWizardPage = (persona) => {
    const wizardMap = {
      municipality_staff: 'MunicipalityStaffOnboarding',
      provider: 'StartupOnboarding',
      researcher: 'ResearcherOnboarding',
      citizen: 'CitizenOnboarding',
      expert: 'ExpertOnboarding'
    };
    return wizardMap[persona] || null;
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(t({ en: 'User not found. Please try logging in again.', ar: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // If specialized wizard needed, mark basic onboarding complete but redirect to specialized wizard
      const redirectToSpecialized = needsSpecializedWizard(formData.selectedPersona);
      
      const updatePayload = {
        full_name: formData.full_name || null,
        job_title: formData.job_title || null,
        department: formData.department || null,
        bio: formData.bio || null,
        bio_en: formData.bio || null,
        organization: formData.organization || null,
        expertise_areas: formData.expertise_areas?.length > 0 ? formData.expertise_areas : null,
        interests: formData.interests?.length > 0 ? formData.interests : null,
        cv_url: formData.cv_url || null,
        linkedin_url: formData.linkedin_url || null,
        work_phone: formData.work_phone || null,
        // Only mark complete if no specialized wizard needed
        onboarding_completed: !redirectToSpecialized,
        onboarding_completed_at: redirectToSpecialized ? null : new Date().toISOString(),
        profile_completion_percentage: calculateProfileCompletion(formData),
        extracted_data: {
          years_of_experience: formData.years_of_experience,
          imported_from_cv: !!formData.cv_url,
          imported_from_linkedin: !!formData.linkedin_url,
          selected_persona: formData.selectedPersona
        },
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile with:', updatePayload);

      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update(updatePayload)
        .eq('user_id', user.id)
        .select('*');
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully:', updateData);

      // Submit role request if needed
      if (formData.requestRole && formData.selectedPersona && formData.roleJustification) {
        const { error: roleError } = await supabase
          .from('role_requests')
          .insert({
            user_id: user.id,
            user_email: user.email,
            requested_role: formData.selectedPersona,
            justification: formData.roleJustification,
            status: 'pending'
          });
        
        if (roleError) {
          console.error('Role request error:', roleError);
          toast.info(t({ en: 'Role request could not be submitted', ar: 'تعذر إرسال طلب الدور' }));
        } else {
          toast.success(t({ en: 'Role request submitted for approval!', ar: 'تم إرسال طلب الدور للموافقة!' }));
        }
      }
      
      // Invalidate queries and refresh auth
      await queryClient.invalidateQueries(['user-profile']);
      
      if (checkAuth) {
        await checkAuth();
      }

      // Redirect to specialized wizard or landing page
      if (redirectToSpecialized) {
        const specializedPage = getSpecializedWizardPage(formData.selectedPersona);
        toast.success(t({ en: 'Great! Now let\'s complete your specialized profile.', ar: 'رائع! الآن دعنا نكمل ملفك المتخصص.' }));
        onComplete?.(formData);
        setTimeout(() => {
          navigate(createPageUrl(specializedPage));
        }, 300);
      } else {
        toast.success(t({ en: 'Welcome aboard! Your profile is set up.', ar: 'مرحباً بك! تم إعداد ملفك الشخصي.' }));
        const landingPage = getLandingPage();
        console.log('Navigating to:', landingPage);
        onComplete?.(formData);
        setTimeout(() => {
          navigate(createPageUrl(landingPage));
        }, 300);
      }
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t({ en: 'Failed to save profile. Please try again.', ar: 'فشل في حفظ الملف الشخصي. يرجى المحاولة مرة أخرى.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user?.id) {
      onSkip?.();
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Skip update error:', error);
        throw error;
      }

      await queryClient.invalidateQueries(['user-profile']);
      if (checkAuth) {
        await checkAuth();
      }
      
      onSkip?.();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Skip error:', error);
      toast.error(t({ en: 'Could not skip onboarding', ar: 'تعذر تخطي الإعداد' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpertise = (item) => {
    const current = formData.expertise_areas || [];
    if (current.includes(item)) {
      setFormData({ ...formData, expertise_areas: current.filter(i => i !== item) });
    } else if (current.length < 5) {
      setFormData({ ...formData, expertise_areas: [...current, item] });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return true; // Import step is optional
      case 3: return formData.full_name?.trim().length > 0;
      case 4: return true;
      case 5: return formData.selectedPersona !== null;
      case 6: return true;
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-slate-900/95 to-blue-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {t({ en: 'Personalize your experience', ar: 'خصص تجربتك' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLanguage}
                className="text-white/70 hover:text-white hover:bg-white/10 font-medium"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === 'en' ? 'عربي' : 'English'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-1" />
                {t({ en: 'Skip', ar: 'تخطي' })}
              </Button>
            </div>
          </div>

          {/* Step Progress */}
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center gap-2 justify-center">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <Badge 
                        className={`
                          px-3 py-2 text-sm transition-all cursor-default border-0
                          ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : ''}
                          ${isComplete ? 'bg-green-600 text-white' : ''}
                          ${!isActive && !isComplete ? 'bg-white/10 text-white/60' : ''}
                        `}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        ) : (
                          <StepIcon className="h-4 w-4 mr-1" />
                        )}
                        {step.id}. {step.title[language]}
                      </Badge>
                      {index < STEPS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-white/30 hidden sm:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <Progress value={progress} className="h-2 mt-4 bg-white/10" />
            </CardContent>
          </Card>

          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🚀</div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t({ en: 'Welcome to Saudi Innovates!', ar: 'مرحباً في الابتكار السعودي!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    {t({ 
                      en: "Let's personalize your experience with AI-powered suggestions. Upload your CV or LinkedIn for smart profile building.",
                      ar: 'دعنا نخصص تجربتك باستخدام الاقتراحات الذكية. ارفع سيرتك الذاتية أو LinkedIn لبناء ملف ذكي.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 px-4 py-3 bg-purple-100 rounded-lg">
                      <Upload className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">{t({ en: 'CV/Resume Import', ar: 'استيراد السيرة الذاتية' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 rounded-lg">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{t({ en: 'LinkedIn Import', ar: 'استيراد LinkedIn' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100 rounded-lg">
                      <Wand2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{t({ en: 'AI Profile Builder', ar: 'منشئ الملف الذكي' })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Import CV/LinkedIn */}
          {currentStep === 2 && (
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Smart Import (Optional)', ar: 'استيراد ذكي (اختياري)' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Upload your CV or enter LinkedIn URL to auto-fill your profile', ar: 'ارفع سيرتك الذاتية أو أدخل رابط LinkedIn لملء ملفك تلقائياً' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CV Upload */}
                <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-10 w-10 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        {t({ en: 'Upload CV/Resume', ar: 'رفع السيرة الذاتية' })}
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        {t({ en: 'AI will extract your name, experience, skills automatically', ar: 'سيستخرج الذكاء الاصطناعي اسمك وخبرتك ومهاراتك تلقائياً' })}
                      </p>
                      <FileUploader
                        onUploadComplete={handleCVUpload}
                        type="document"
                        label={t({ en: 'Upload CV (PDF, DOCX)', ar: 'رفع السيرة الذاتية (PDF, DOCX)' })}
                        maxSize={10}
                      />
                      {isExtractingCV && (
                        <div className="flex items-center gap-2 mt-3 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t({ en: 'AI is extracting your information...', ar: 'الذكاء الاصطناعي يستخرج معلوماتك...' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">{t({ en: 'OR', ar: 'أو' })}</span>
                  </div>
                </div>

                {/* LinkedIn Import */}
                <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-start gap-4">
                    <Linkedin className="h-10 w-10 text-blue-700 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        {t({ en: 'LinkedIn Profile', ar: 'ملف LinkedIn' })}
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        {t({ en: 'Enter your LinkedIn URL for profile suggestions', ar: 'أدخل رابط LinkedIn الخاص بك للحصول على اقتراحات الملف الشخصي' })}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="flex-1"
                        />
                        <Button
                          onClick={handleLinkedInImport}
                          disabled={isExtractingLinkedIn || !formData.linkedin_url}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isExtractingLinkedIn ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Status */}
                {(formData.cv_url || formData.linkedin_url) && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{t({ en: 'Profile data imported!', ar: 'تم استيراد بيانات الملف!' })}</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {t({ en: 'Review and edit in the next step', ar: 'راجع وحرر في الخطوة التالية' })}
                    </p>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  {t({ en: 'You can skip this step and fill in details manually', ar: 'يمكنك تخطي هذه الخطوة وملء التفاصيل يدوياً' })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Profile */}
          {currentStep === 3 && (
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Your Profile', ar: 'ملفك الشخصي' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formData.cv_url || formData.linkedin_url 
                    ? t({ en: 'Review and edit the imported data', ar: 'راجع وحرر البيانات المستوردة' })
                    : t({ en: 'Tell us about yourself', ar: 'أخبرنا عن نفسك' })
                  }
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <Label className="text-base font-semibold text-blue-900 mb-3 block">
                    {t({ en: 'Full Name *', ar: 'الاسم الكامل *' })}
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder={t({ en: 'Your full name', ar: 'اسمك الكامل' })}
                    className="h-12 text-base border-2"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</Label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      placeholder={t({ en: 'e.g., Innovation Manager', ar: 'مثال: مدير الابتكار' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Organization', ar: 'المنظمة' })}</Label>
                    <Input
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={t({ en: 'Your organization name', ar: 'اسم منظمتك' })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Department', ar: 'القسم' })}</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder={t({ en: 'Your department', ar: 'قسمك' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })}</Label>
                    <Input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{t({ en: 'Short Bio', ar: 'نبذة قصيرة' })}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder={t({ en: 'Tell us about yourself and your interests...', ar: 'أخبرنا قليلاً عن نفسك واهتماماتك...' })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: AI Suggestions */}
          {currentStep === 4 && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  {t({ en: 'AI Profile Assistant', ar: 'مساعد الملف الذكي' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Get personalized suggestions to enhance your profile', ar: 'احصل على اقتراحات مخصصة لتحسين ملفك الشخصي' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {!aiSuggestions && (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t({ en: 'Let AI analyze your profile and suggest improvements', ar: 'دع الذكاء الاصطناعي يحلل ملفك ويقترح تحسينات' })}
                      </p>
                    </div>
                    <Button
                      onClick={generateAISuggestions}
                      disabled={isGeneratingAI}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'Generate AI Suggestions', ar: 'إنشاء اقتراحات ذكية' })}
                    </Button>
                  </div>
                )}

                {aiSuggestions && (
                  <div className="space-y-4">
                    {/* Improved Bio */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-purple-800">{t({ en: 'Suggested Bio', ar: 'السيرة المقترحة' })}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => applyAISuggestion('bio', language === 'ar' ? aiSuggestions.improved_bio_ar : aiSuggestions.improved_bio_en)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Apply', ar: 'تطبيق' })}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700">
                        {language === 'ar' ? aiSuggestions.improved_bio_ar : aiSuggestions.improved_bio_en}
                      </p>
                    </div>

                    {/* Recommended Persona */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-blue-800">{t({ en: 'Recommended Role', ar: 'الدور الموصى به' })}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => applyAISuggestion('persona', aiSuggestions.recommended_persona)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Apply', ar: 'تطبيق' })}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600">{PERSONAS.find(p => p.id === aiSuggestions.recommended_persona)?.title[language]}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {language === 'ar' ? aiSuggestions.persona_reason_ar : aiSuggestions.persona_reason_en}
                      </p>
                    </div>

                    {/* Suggested Expertise */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-green-800">{t({ en: 'Suggested Expertise', ar: 'الخبرات المقترحة' })}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => applyAISuggestion('expertise', aiSuggestions.suggested_expertise)}
                          className="text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Apply All', ar: 'تطبيق الكل' })}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.suggested_expertise?.map((exp, i) => (
                          <Badge key={i} variant="outline" className="bg-white">{exp}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Getting Started Tips */}
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-semibold text-amber-800 mb-2">{t({ en: 'Getting Started Tips', ar: 'نصائح البدء' })}</p>
                      <ul className="space-y-1">
                        {(language === 'ar' ? aiSuggestions.getting_started_tips_ar : aiSuggestions.getting_started_tips_en)?.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant="outline"
                      onClick={generateAISuggestions}
                      disabled={isGeneratingAI}
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                      {t({ en: 'Regenerate Suggestions', ar: 'إعادة إنشاء الاقتراحات' })}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Persona Selection */}
          {currentStep === 5 && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  {t({ en: 'Select Your Role', ar: 'اختر دورك' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'This personalizes your dashboard and features', ar: 'هذا يخصص لوحة التحكم والميزات الخاصة بك' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PERSONAS.map((persona) => {
                    const Icon = persona.icon;
                    const isSelected = formData.selectedPersona === persona.id;
                    
                    return (
                      <div
                        key={persona.id}
                        onClick={() => setFormData({ ...formData, selectedPersona: persona.id })}
                        className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? `${persona.borderColor} ${persona.bgColor} ring-2 ring-offset-2 ring-purple-400` 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${persona.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{persona.title[language]}</h4>
                            <p className="text-sm text-slate-600 mt-1">{persona.description[language]}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expertise Selection */}
                <div className="pt-4 border-t">
                  <Label className="text-base font-medium mb-3 block">
                    {t({ en: 'Select Your Expertise Areas', ar: 'اختر مجالات خبرتك' })}
                    <span className="text-sm text-muted-foreground ml-2">({t({ en: 'up to 5', ar: 'حتى 5' })})</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_OPTIONS.map((exp) => {
                      const isSelected = formData.expertise_areas?.includes(exp.en);
                      return (
                        <Badge
                          key={exp.en}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${isSelected ? 'bg-purple-600' : 'hover:bg-purple-50'}`}
                          onClick={() => toggleExpertise(exp.en)}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {exp[language]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Role Request */}
                {formData.selectedPersona && formData.selectedPersona !== 'viewer' && formData.selectedPersona !== 'citizen' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={formData.requestRole}
                        onCheckedChange={(checked) => setFormData({ ...formData, requestRole: checked })}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">
                          {t({ en: 'Request official role assignment', ar: 'طلب تعيين دور رسمي' })}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          {t({ en: 'An admin will review and approve your role request', ar: 'سيراجع المسؤول طلب الدور الخاص بك ويوافق عليه' })}
                        </p>
                      </div>
                    </div>
                    {formData.requestRole && (
                      <Textarea
                        value={formData.roleJustification}
                        onChange={(e) => setFormData({ ...formData, roleJustification: e.target.value })}
                        placeholder={t({ en: 'Why do you need this role? (e.g., organization affiliation, responsibilities)', ar: 'لماذا تحتاج هذا الدور؟ (مثال: الانتماء للمنظمة، المسؤوليات)' })}
                        className="mt-3"
                        rows={2}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Complete */}
          {currentStep === 6 && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-700">
                    {t({ en: "You're All Set!", ar: 'أنت جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({ 
                      en: "Your profile is ready. Let's explore innovation opportunities!",
                      ar: 'ملفك الشخصي جاهز. دعنا نستكشف فرص الابتكار!'
                    })}
                  </p>
                  
                  {/* Profile Summary */}
                  <div className="p-4 bg-white rounded-lg border text-left max-w-md mx-auto">
                    <h3 className="font-semibold mb-3">{t({ en: 'Your Profile Summary', ar: 'ملخص ملفك' })}</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>{t({ en: 'Name:', ar: 'الاسم:' })}</strong> {formData.full_name}</p>
                      {formData.job_title && <p><strong>{t({ en: 'Title:', ar: 'المسمى:' })}</strong> {formData.job_title}</p>}
                      {formData.organization && <p><strong>{t({ en: 'Organization:', ar: 'المنظمة:' })}</strong> {formData.organization}</p>}
                      <p><strong>{t({ en: 'Role:', ar: 'الدور:' })}</strong> {selectedPersona?.title[language]}</p>
                      {formData.expertise_areas?.length > 0 && (
                        <div>
                          <strong>{t({ en: 'Expertise:', ar: 'الخبرات:' })}</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.expertise_areas.map((exp, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(formData.cv_url || formData.linkedin_url) && (
                        <p className="text-green-600 flex items-center gap-1 mt-2">
                          <CheckCircle2 className="h-4 w-4" />
                          {t({ en: 'Profile imported from', ar: 'تم استيراد الملف من' })} 
                          {formData.cv_url && ' CV'}
                          {formData.cv_url && formData.linkedin_url && ' & '}
                          {formData.linkedin_url && ' LinkedIn'}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t({ en: 'Profile Completion:', ar: 'اكتمال الملف:' })}</span>
                        <Progress value={calculateProfileCompletion(formData)} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{calculateProfileCompletion(formData)}%</span>
                      </div>
                    </div>
                  </div>

                  {formData.requestRole && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-amber-800">
                        {t({ en: '⏳ Your role request is pending admin approval', ar: '⏳ طلب الدور الخاص بك في انتظار موافقة المسؤول' })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Complete & Start Exploring', ar: 'إكمال وبدء الاستكشاف' })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
