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
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, 
  Building2, Lightbulb, FlaskConical, Users, Eye,
  Rocket, Target, BookOpen, Network, X, Loader2,
  User, Briefcase, GraduationCap, Wand2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

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
  { id: 2, title: { en: 'Profile', ar: 'الملف' }, icon: User },
  { id: 3, title: { en: 'AI Assist', ar: 'مساعد ذكي' }, icon: Wand2 },
  { id: 4, title: { en: 'Role', ar: 'الدور' }, icon: Briefcase },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

export default function OnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth, userRoles } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
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
    roleJustification: ''
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
        expertise_areas: userProfile?.expertise_areas || [],
        interests: userProfile?.interests || [],
      }));
    }
  }, [userProfile, user]);

  const progress = (currentStep / STEPS.length) * 100;
  const selectedPersona = PERSONAS.find(p => p.id === formData.selectedPersona);

  const calculateProfileCompletion = (data) => {
    let score = 0;
    if (data.full_name) score += 25;
    if (data.job_title) score += 20;
    if (data.bio) score += 15;
    if (data.selectedPersona) score += 20;
    if (data.expertise_areas?.length > 0) score += 20;
    return Math.min(score, 100);
  };

  // Get role-based landing page
  const getLandingPage = () => {
    // Check user roles first
    if (userRoles?.length > 0) {
      const role = userRoles[0]?.role;
      if (role === 'admin') return 'AdminDashboard';
      if (role === 'municipality_admin' || role === 'municipality_staff') return 'MunicipalityDashboard';
      if (role === 'provider') return 'ProviderDashboard';
      if (role === 'researcher') return 'ResearcherDashboard';
      if (role === 'citizen') return 'CitizenDashboard';
    }
    // Fall back to selected persona
    if (selectedPersona) {
      return selectedPersona.landingPage;
    }
    return 'Home';
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

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(t({ en: 'User not found. Please try logging in again.', ar: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatePayload = {
        full_name: formData.full_name || null,
        job_title: formData.job_title || null,
        department: formData.department || null,
        bio: formData.bio || null,
        bio_en: formData.bio || null,
        expertise_areas: formData.expertise_areas?.length > 0 ? formData.expertise_areas : null,
        interests: formData.interests?.length > 0 ? formData.interests : null,
        onboarding_completed: true,
        profile_completion_percentage: calculateProfileCompletion(formData),
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
      
      // Force refresh auth state
      if (checkAuth) {
        await checkAuth();
      }
      
      toast.success(t({ en: 'Welcome aboard! Your profile is set up.', ar: 'مرحباً بك! تم إعداد ملفك الشخصي.' }));
      
      // Navigate to role-based landing page
      const landingPage = getLandingPage();
      console.log('Navigating to:', landingPage);
      
      // Call onComplete callback
      onComplete?.(formData);
      
      // Navigate after a short delay to ensure state updates
      setTimeout(() => {
        navigate(createPageUrl(landingPage));
      }, 300);
      
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
      case 2: return formData.full_name?.trim().length > 0;
      case 3: return true;
      case 4: return formData.selectedPersona !== null;
      case 5: return true;
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
                      en: "Let's personalize your experience with AI-powered suggestions. This takes just a minute.",
                      ar: 'دعنا نخصص تجربتك باستخدام الاقتراحات الذكية. سيستغرق هذا دقيقة واحدة فقط.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 px-4 py-3 bg-purple-100 rounded-lg">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">{t({ en: 'AI Profile Builder', ar: 'منشئ الملف الذكي' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{t({ en: 'Personalized Experience', ar: 'تجربة مخصصة' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100 rounded-lg">
                      <Network className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{t({ en: 'Smart Matching', ar: 'مطابقة ذكية' })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profile */}
          {currentStep === 2 && (
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Tell us about yourself', ar: 'أخبرنا عن نفسك' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'This helps AI personalize your experience', ar: 'هذا يساعد الذكاء الاصطناعي على تخصيص تجربتك' })}
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
                
                <div className="space-y-2">
                  <Label>{t({ en: 'Short Bio', ar: 'نبذة قصيرة' })}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder={t({ en: 'Tell us a bit about yourself and your interests...', ar: 'أخبرنا قليلاً عن نفسك واهتماماتك...' })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: AI Suggestions */}
          {currentStep === 3 && (
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

          {/* Step 4: Persona Selection */}
          {currentStep === 4 && (
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

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-700">
                    {t({ en: "You're All Set!", ar: 'أنت جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({ 
                      en: "Your profile is ready. Click below to start exploring Saudi Innovates.",
                      ar: 'ملفك الشخصي جاهز. انقر أدناه لبدء استكشاف الابتكار السعودي.'
                    })}
                  </p>
                  
                  {/* Profile Summary */}
                  <div className="max-w-md mx-auto text-left bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold mb-3">{t({ en: 'Profile Summary', ar: 'ملخص الملف' })}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ en: 'Name', ar: 'الاسم' })}</span>
                        <span className="font-medium">{formData.full_name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ en: 'Role', ar: 'الدور' })}</span>
                        <span className="font-medium">{selectedPersona?.title[language] || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ en: 'Expertise', ar: 'الخبرات' })}</span>
                        <span className="font-medium">{formData.expertise_areas?.length || 0} {t({ en: 'areas', ar: 'مجالات' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ en: 'Completion', ar: 'الاكتمال' })}</span>
                        <span className="font-medium text-green-600">{calculateProfileCompletion(formData)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
                      {t({ en: `You'll be redirected to: ${selectedPersona?.title[language] || 'Home'}`, ar: `سيتم توجيهك إلى: ${selectedPersona?.title[language] || 'الرئيسية'}` })}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Previous', ar: 'السابق' })}
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
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Start Exploring', ar: 'ابدأ الاستكشاف' })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
