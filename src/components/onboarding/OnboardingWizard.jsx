import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, 
  Building2, Lightbulb, FlaskConical, Users, Eye,
  Rocket, Target, BookOpen, Network, X, Loader2,
  User, Briefcase, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

const PERSONAS = [
  {
    id: 'municipality_staff',
    icon: Building2,
    color: 'purple',
    title: { en: 'Municipality Staff', ar: 'موظف بلدية' },
    description: { en: 'I work at a municipality and want to solve urban challenges', ar: 'أعمل في بلدية وأريد حل التحديات الحضرية' },
    features: ['Challenges', 'Pilots', 'Programs', 'MunicipalityDashboard']
  },
  {
    id: 'provider',
    icon: Rocket,
    color: 'blue',
    title: { en: 'Solution Provider / Startup', ar: 'مزود حلول / شركة ناشئة' },
    description: { en: 'I have solutions to offer and want to find opportunities', ar: 'لدي حلول أريد تقديمها وأبحث عن فرص' },
    features: ['Solutions', 'Challenges', 'OpportunityFeed', 'MatchmakerJourney']
  },
  {
    id: 'researcher',
    icon: FlaskConical,
    color: 'green',
    title: { en: 'Researcher / Academic', ar: 'باحث / أكاديمي' },
    description: { en: 'I conduct R&D and want to collaborate with municipalities', ar: 'أقوم بالبحث والتطوير وأريد التعاون مع البلديات' },
    features: ['RDProjects', 'RDCalls', 'Knowledge', 'ResearcherNetwork']
  },
  {
    id: 'citizen',
    icon: Users,
    color: 'orange',
    title: { en: 'Citizen / Community Member', ar: 'مواطن / عضو مجتمع' },
    description: { en: 'I want to contribute ideas and participate in pilots', ar: 'أريد المساهمة بأفكار والمشاركة في التجارب' },
    features: ['PublicIdeaSubmission', 'CitizenDashboard', 'PublicPortal']
  },
  {
    id: 'viewer',
    icon: Eye,
    color: 'slate',
    title: { en: 'Explorer / Observer', ar: 'مستكشف / مراقب' },
    description: { en: 'I want to explore and learn about innovation initiatives', ar: 'أريد استكشاف ومعرفة المزيد عن مبادرات الابتكار' },
    features: ['PublicPortal', 'Knowledge', 'Network']
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
  { id: 2, title: { en: 'Profile', ar: 'الملف الشخصي' }, icon: User },
  { id: 3, title: { en: 'Role', ar: 'الدور' }, icon: Briefcase },
  { id: 4, title: { en: 'Expertise', ar: 'الخبرات' }, icon: GraduationCap },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

export default function OnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    job_title: userProfile?.job_title || '',
    department: userProfile?.department || '',
    bio: userProfile?.bio || '',
    organization: userProfile?.organization || '',
    selectedPersona: null,
    expertise_areas: userProfile?.expertise_areas || [],
    interests: userProfile?.interests || [],
    requestRole: false,
    roleJustification: ''
  });

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

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(t({ en: 'User not found. Please try logging in again.', ar: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update user profile with onboarding data
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          job_title: formData.job_title,
          department: formData.department,
          bio: formData.bio,
          expertise_areas: formData.expertise_areas,
          interests: formData.interests,
          onboarding_completed: true,
          profile_completion_percentage: calculateProfileCompletion(formData)
        })
        .eq('user_id', user.id)
        .select();
      
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
          // Don't throw - role request is optional
          toast.error(t({ en: 'Could not submit role request', ar: 'تعذر إرسال طلب الدور' }));
        } else {
          toast.success(t({ en: 'Role request submitted!', ar: 'تم إرسال طلب الدور!' }));
        }
      }
      
      // Invalidate queries and refresh auth
      await queryClient.invalidateQueries(['user-profile']);
      await checkAuth?.();
      
      toast.success(t({ en: 'Welcome aboard! Your profile is set up.', ar: 'مرحباً بك! تم إعداد ملفك الشخصي.' }));
      onComplete?.(formData);
      
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
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      if (error) throw error;

      await queryClient.invalidateQueries(['user-profile']);
      await checkAuth?.();
      onSkip?.();
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
      case 3: return formData.selectedPersona !== null;
      case 4: return true;
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

          {/* Step Progress Card */}
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
                        variant={isComplete ? 'default' : isActive ? 'default' : 'outline'}
                        className={`
                          px-3 py-2 text-sm transition-all cursor-default
                          ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' : ''}
                          ${isComplete ? 'bg-green-600 text-white' : ''}
                          ${!isActive && !isComplete ? 'bg-white/10 text-white/60 border-white/20' : ''}
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

          {/* Step Content */}
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <Card className="border-2 border-purple-400/30 bg-gradient-to-br from-purple-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🚀</div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t({ en: 'Welcome to Saudi Innovates!', ar: 'مرحباً في الابتكار السعودي!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    {t({ 
                      en: "Let's set up your profile to personalize your experience. This will only take a minute.",
                      ar: 'دعنا نُعد ملفك الشخصي لتخصيص تجربتك. سيستغرق هذا دقيقة واحدة فقط.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 px-4 py-3 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">{t({ en: 'Discover Challenges', ar: 'اكتشف التحديات' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{t({ en: 'Share Solutions', ar: 'شارك الحلول' })}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100 rounded-lg">
                      <Network className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{t({ en: 'Connect & Collaborate', ar: 'تواصل وتعاون' })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profile */}
          {currentStep === 2 && (
            <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Step 2: Tell us about yourself', ar: 'الخطوة 2: أخبرنا عن نفسك' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Basic information to get started', ar: 'معلومات أساسية للبدء' })}
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

          {/* Step 3: Persona Selection */}
          {currentStep === 3 && (
            <Card className="border-2 border-green-400/30 bg-gradient-to-br from-green-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  {t({ en: 'Step 3: What best describes you?', ar: 'الخطوة 3: ما الذي يصفك أفضل؟' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'This helps us personalize your experience', ar: 'هذا يساعدنا على تخصيص تجربتك' })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERSONAS.map((persona) => {
                    const Icon = persona.icon;
                    const isSelected = formData.selectedPersona === persona.id;
                    
                    return (
                      <div
                        key={persona.id}
                        onClick={() => setFormData({ ...formData, selectedPersona: persona.id })}
                        className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg
                          ${isSelected 
                            ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-500/20' 
                            : 'border-slate-200 hover:border-green-300 bg-white'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            p-3 rounded-lg
                            ${isSelected ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}
                          `}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{persona.title[language]}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{persona.description[language]}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Role Request Option */}
                {formData.selectedPersona && formData.selectedPersona !== 'viewer' && formData.selectedPersona !== 'citizen' && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="requestRole"
                        checked={formData.requestRole}
                        onChange={(e) => setFormData({ ...formData, requestRole: e.target.checked })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="requestRole" className="font-medium cursor-pointer">
                          {t({ en: 'Request elevated access for this role', ar: 'طلب صلاحيات مرتفعة لهذا الدور' })}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {t({ en: 'An admin will review your request', ar: 'سيراجع المسؤول طلبك' })}
                        </p>
                        
                        {formData.requestRole && (
                          <Textarea
                            value={formData.roleJustification}
                            onChange={(e) => setFormData({ ...formData, roleJustification: e.target.value })}
                            placeholder={t({ en: 'Please explain why you need this role...', ar: 'يرجى شرح سبب حاجتك لهذا الدور...' })}
                            className="mt-3"
                            rows={3}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Expertise */}
          {currentStep === 4 && (
            <Card className="border-2 border-orange-400/30 bg-gradient-to-br from-orange-50 to-white shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <GraduationCap className="h-5 w-5 text-orange-600" />
                  {t({ en: 'Step 4: Your Areas of Expertise', ar: 'الخطوة 4: مجالات خبرتك' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Select up to 5 areas (optional)', ar: 'اختر حتى 5 مجالات (اختياري)' })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {EXPERTISE_OPTIONS.map((item) => {
                    const isSelected = formData.expertise_areas?.includes(item.en);
                    return (
                      <Badge
                        key={item.en}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`
                          px-4 py-2 text-sm cursor-pointer transition-all
                          ${isSelected 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'hover:bg-orange-100 border-orange-200'
                          }
                        `}
                        onClick={() => toggleExpertise(item.en)}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {item[language]}
                      </Badge>
                    );
                  })}
                </div>
                {formData.expertise_areas?.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {t({ en: 'Selected', ar: 'المحدد' })}: {formData.expertise_areas.length}/5
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <Card className="border-2 border-purple-400/30 bg-gradient-to-br from-purple-50 via-pink-50 to-white shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t({ en: "You're all set!", ar: 'أنت جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    {t({ 
                      en: "Click 'Complete Setup' to start exploring the platform.",
                      ar: 'انقر على "إكمال الإعداد" لبدء استكشاف المنصة.'
                    })}
                  </p>
                  
                  {/* Summary */}
                  <div className="bg-white/80 rounded-xl p-6 max-w-md mx-auto text-left space-y-3 border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t({ en: 'Name', ar: 'الاسم' })}</span>
                      <span className="font-medium">{formData.full_name || '-'}</span>
                    </div>
                    {formData.job_title && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ en: 'Title', ar: 'المسمى' })}</span>
                        <span className="font-medium">{formData.job_title}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t({ en: 'Role', ar: 'الدور' })}</span>
                      <span className="font-medium">{selectedPersona?.title[language] || '-'}</span>
                    </div>
                    {formData.expertise_areas?.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ en: 'Expertise', ar: 'الخبرات' })}</span>
                        <span className="font-medium">{formData.expertise_areas.length} {t({ en: 'areas', ar: 'مجالات' })}</span>
                      </div>
                    )}
                    {formData.requestRole && (
                      <div className="pt-2 border-t">
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          {t({ en: 'Role request pending', ar: 'طلب الدور قيد الانتظار' })}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              >
                {t({ en: 'Continue', ar: 'متابعة' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Complete Setup', ar: 'إكمال الإعداد' })}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
