import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, 
  Building2, Lightbulb, FlaskConical, Users, Eye,
  Rocket, Target, BookOpen, Network, Send, X
} from 'lucide-react';
import { toast } from 'sonner';

const PERSONAS = [
  {
    id: 'municipality_staff',
    icon: Building2,
    title: { en: 'Municipality Staff', ar: 'موظف بلدية' },
    description: { en: 'I work at a municipality and want to solve urban challenges', ar: 'أعمل في بلدية وأريد حل التحديات الحضرية' },
    features: ['Challenges', 'Pilots', 'Programs', 'MunicipalityDashboard']
  },
  {
    id: 'provider',
    icon: Rocket,
    title: { en: 'Solution Provider / Startup', ar: 'مزود حلول / شركة ناشئة' },
    description: { en: 'I have solutions to offer and want to find opportunities', ar: 'لدي حلول أريد تقديمها وأبحث عن فرص' },
    features: ['Solutions', 'Challenges', 'OpportunityFeed', 'MatchmakerJourney']
  },
  {
    id: 'researcher',
    icon: FlaskConical,
    title: { en: 'Researcher / Academic', ar: 'باحث / أكاديمي' },
    description: { en: 'I conduct R&D and want to collaborate with municipalities', ar: 'أقوم بالبحث والتطوير وأريد التعاون مع البلديات' },
    features: ['RDProjects', 'RDCalls', 'Knowledge', 'ResearcherNetwork']
  },
  {
    id: 'citizen',
    icon: Users,
    title: { en: 'Citizen / Community Member', ar: 'مواطن / عضو مجتمع' },
    description: { en: 'I want to contribute ideas and participate in pilots', ar: 'أريد المساهمة بأفكار والمشاركة في التجارب' },
    features: ['PublicIdeaSubmission', 'CitizenDashboard', 'PublicPortal']
  },
  {
    id: 'viewer',
    icon: Eye,
    title: { en: 'Explorer / Observer', ar: 'مستكشف / مراقب' },
    description: { en: 'I want to explore and learn about innovation initiatives', ar: 'أريد استكشاف ومعرفة المزيد عن مبادرات الابتكار' },
    features: ['PublicPortal', 'Knowledge', 'Network']
  }
];

const FEATURE_INFO = {
  Challenges: { icon: Target, title: { en: 'Challenges', ar: 'التحديات' }, desc: { en: 'Browse and submit urban challenges', ar: 'تصفح وأضف التحديات الحضرية' } },
  Pilots: { icon: Rocket, title: { en: 'Pilots', ar: 'التجارب' }, desc: { en: 'Test innovative solutions', ar: 'اختبر الحلول المبتكرة' } },
  Programs: { icon: BookOpen, title: { en: 'Programs', ar: 'البرامج' }, desc: { en: 'Innovation programs and accelerators', ar: 'برامج الابتكار والمسرعات' } },
  Solutions: { icon: Lightbulb, title: { en: 'Solutions', ar: 'الحلول' }, desc: { en: 'Showcase your solutions', ar: 'اعرض حلولك' } },
  RDProjects: { icon: FlaskConical, title: { en: 'R&D Projects', ar: 'مشاريع البحث' }, desc: { en: 'Research collaborations', ar: 'التعاون البحثي' } },
  RDCalls: { icon: FlaskConical, title: { en: 'R&D Calls', ar: 'طلبات البحث' }, desc: { en: 'Apply to research calls', ar: 'تقدم لطلبات البحث' } },
  Knowledge: { icon: BookOpen, title: { en: 'Knowledge Hub', ar: 'مركز المعرفة' }, desc: { en: 'Best practices and case studies', ar: 'أفضل الممارسات ودراسات الحالة' } },
  Network: { icon: Network, title: { en: 'Network', ar: 'الشبكة' }, desc: { en: 'Connect with innovators', ar: 'تواصل مع المبتكرين' } },
  OpportunityFeed: { icon: Sparkles, title: { en: 'Opportunity Feed', ar: 'الفرص' }, desc: { en: 'Discover new opportunities', ar: 'اكتشف فرص جديدة' } },
  MatchmakerJourney: { icon: Target, title: { en: 'Matchmaker', ar: 'التوفيق' }, desc: { en: 'Match with challenges', ar: 'التوفيق مع التحديات' } },
  MunicipalityDashboard: { icon: Building2, title: { en: 'Municipality Dashboard', ar: 'لوحة البلدية' }, desc: { en: 'Manage your municipality', ar: 'إدارة بلديتك' } },
  ResearcherNetwork: { icon: Network, title: { en: 'Researcher Network', ar: 'شبكة الباحثين' }, desc: { en: 'Connect with researchers', ar: 'تواصل مع الباحثين' } },
  PublicIdeaSubmission: { icon: Lightbulb, title: { en: 'Submit Ideas', ar: 'إرسال أفكار' }, desc: { en: 'Share your innovative ideas', ar: 'شارك أفكارك المبتكرة' } },
  CitizenDashboard: { icon: Users, title: { en: 'Citizen Dashboard', ar: 'لوحة المواطن' }, desc: { en: 'Track your contributions', ar: 'تتبع مساهماتك' } },
  PublicPortal: { icon: Eye, title: { en: 'Public Portal', ar: 'البوابة العامة' }, desc: { en: 'Explore public initiatives', ar: 'استكشف المبادرات العامة' } },
};

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

export default function OnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    full_name: userProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    job_title: userProfile?.job_title || '',
    department: userProfile?.department || '',
    bio: userProfile?.bio || '',
    organization: '',
    selectedPersona: null,
    expertise_areas: userProfile?.expertise_areas || [],
    interests: userProfile?.interests || [],
    requestRole: false,
    roleJustification: ''
  });

  const steps = [
    { title: { en: 'Welcome', ar: 'مرحباً' }, icon: '👋' },
    { title: { en: 'Profile', ar: 'الملف الشخصي' }, icon: '👤' },
    { title: { en: 'Who Are You?', ar: 'من أنت؟' }, icon: '🎭' },
    { title: { en: 'Expertise', ar: 'الخبرات' }, icon: '🎯' },
    { title: { en: 'Features', ar: 'المميزات' }, icon: '✨' },
    { title: { en: 'Complete', ar: 'اكتمال' }, icon: '🎉' }
  ];

  const progress = (step / steps.length) * 100;
  const selectedPersona = PERSONAS.find(p => p.id === data.selectedPersona);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileData.full_name,
          job_title: profileData.job_title,
          department: profileData.department,
          bio: profileData.bio,
          expertise_areas: profileData.expertise_areas,
          interests: profileData.interests,
          onboarding_completed: true,
          profile_completion_percentage: calculateProfileCompletion(profileData)
        })
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return profileData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      checkAuth?.();
      toast.success(t({ en: 'Profile saved successfully!', ar: 'تم حفظ الملف الشخصي بنجاح!' }));
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error(t({ en: 'Failed to save profile', ar: 'فشل في حفظ الملف الشخصي' }));
    }
  });

  const requestRoleMutation = useMutation({
    mutationFn: async ({ role, justification }) => {
      const { error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user?.id,
          user_email: user?.email,
          requested_role: role,
          justification: justification,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t({ en: 'Role request submitted!', ar: 'تم إرسال طلب الدور!' }));
    }
  });

  const skipOnboardingMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      checkAuth?.();
      onSkip?.();
    }
  });

  const calculateProfileCompletion = (profileData) => {
    let score = 0;
    if (profileData.full_name) score += 20;
    if (profileData.job_title) score += 20;
    if (profileData.department) score += 15;
    if (profileData.bio) score += 15;
    if (profileData.expertise_areas?.length > 0) score += 15;
    if (profileData.interests?.length > 0) score += 15;
    return score;
  };

  const handleComplete = async () => {
    try {
      await updateProfileMutation.mutateAsync(data);
      
      if (data.requestRole && data.selectedPersona && data.roleJustification) {
        await requestRoleMutation.mutateAsync({
          role: data.selectedPersona,
          justification: data.roleJustification
        });
      }
      
      onComplete?.(data);
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
  };

  const toggleExpertise = (item) => {
    const current = data.expertise_areas || [];
    if (current.includes(item)) {
      setData({ ...data, expertise_areas: current.filter(i => i !== item) });
    } else if (current.length < 5) {
      setData({ ...data, expertise_areas: [...current, item] });
    }
  };

  const toggleInterest = (item) => {
    const current = data.interests || [];
    if (current.includes(item)) {
      setData({ ...data, interests: current.filter(i => i !== item) });
    } else if (current.length < 5) {
      setData({ ...data, interests: [...current, item] });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header with Skip */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Step', ar: 'الخطوة' })} {step}/{steps.length}
              </p>
              <Progress value={progress} className="h-2 w-48" />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => skipOnboardingMutation.mutate()}
              disabled={skipOnboardingMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              {t({ en: 'Skip', ar: 'تخطي' })}
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center min-w-[50px]">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  i + 1 === step ? 'bg-primary text-primary-foreground scale-110 shadow-lg' :
                  i + 1 < step ? 'bg-green-600 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
                </div>
                <p className="text-xs mt-1 font-medium text-center hidden sm:block">{s.title[language]}</p>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card className="shadow-xl border-0 bg-card">
            <CardContent className="pt-6 pb-8">
              {/* Step 1: Welcome */}
              {step === 1 && (
                <div className="text-center space-y-4 py-8">
                  <div className="text-7xl mb-4">👋</div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {t({ en: 'Welcome to Saudi Innovates!', ar: 'مرحباً في الابتكار السعودي!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    {t({ 
                      en: "Let's personalize your experience. This will only take a few minutes.",
                      ar: 'دعنا نخصص تجربتك. سيستغرق هذا بضع دقائق فقط.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <Badge variant="outline" className="px-4 py-2">
                      <Target className="h-4 w-4 mr-2" />
                      {t({ en: 'Find Challenges', ar: 'اكتشف التحديات' })}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {t({ en: 'Share Solutions', ar: 'شارك الحلول' })}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <Network className="h-4 w-4 mr-2" />
                      {t({ en: 'Connect', ar: 'تواصل' })}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Basics */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{t({ en: 'Tell us about yourself', ar: 'أخبرنا عن نفسك' })}</h2>
                    <p className="text-muted-foreground">{t({ en: 'Basic information to get started', ar: 'معلومات أساسية للبدء' })}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t({ en: 'Full Name', ar: 'الاسم الكامل' })} *</label>
                      <Input
                        value={data.full_name}
                        onChange={(e) => setData({ ...data, full_name: e.target.value })}
                        placeholder={t({ en: 'Your full name', ar: 'اسمك الكامل' })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</label>
                      <Input
                        value={data.job_title}
                        onChange={(e) => setData({ ...data, job_title: e.target.value })}
                        placeholder={t({ en: 'e.g., Innovation Manager', ar: 'مثال: مدير الابتكار' })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t({ en: 'Department', ar: 'القسم' })}</label>
                      <Input
                        value={data.department}
                        onChange={(e) => setData({ ...data, department: e.target.value })}
                        placeholder={t({ en: 'e.g., Urban Development', ar: 'مثال: التطوير الحضري' })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t({ en: 'Organization', ar: 'المنظمة' })}</label>
                      <Input
                        value={data.organization}
                        onChange={(e) => setData({ ...data, organization: e.target.value })}
                        placeholder={t({ en: 'Your organization name', ar: 'اسم منظمتك' })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Short Bio', ar: 'نبذة قصيرة' })}</label>
                    <Textarea
                      value={data.bio}
                      onChange={(e) => setData({ ...data, bio: e.target.value })}
                      rows={3}
                      placeholder={t({ en: 'Tell us a bit about yourself...', ar: 'أخبرنا قليلاً عن نفسك...' })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Persona Selection */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{t({ en: 'What best describes you?', ar: 'ما الذي يصفك أفضل؟' })}</h2>
                    <p className="text-muted-foreground">{t({ en: "This helps us personalize your experience", ar: 'هذا يساعدنا على تخصيص تجربتك' })}</p>
                  </div>
                  
                  <div className="grid gap-3">
                    {PERSONAS.map((persona) => {
                      const Icon = persona.icon;
                      const isSelected = data.selectedPersona === persona.id;
                      
                      return (
                        <button
                          key={persona.id}
                          onClick={() => setData({ ...data, selectedPersona: persona.id })}
                          className={`w-full p-4 rounded-xl border-2 text-start transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{persona.title[language]}</p>
                              <p className="text-sm text-muted-foreground">{persona.description[language]}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="h-6 w-6 text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Role Request Option */}
                  {data.selectedPersona && !['viewer', 'citizen'].includes(data.selectedPersona) && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={data.requestRole}
                          onChange={(e) => setData({ ...data, requestRole: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            {t({ en: 'Request official role access', ar: 'طلب صلاحية دور رسمي' })}
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {t({ 
                              en: 'Get additional permissions to submit content and manage projects',
                              ar: 'احصل على صلاحيات إضافية لإضافة المحتوى وإدارة المشاريع'
                            })}
                          </p>
                        </div>
                      </label>
                      
                      {data.requestRole && (
                        <div className="mt-4">
                          <Textarea
                            value={data.roleJustification}
                            onChange={(e) => setData({ ...data, roleJustification: e.target.value })}
                            rows={3}
                            placeholder={t({ 
                              en: 'Tell us why you need this role...',
                              ar: 'أخبرنا لماذا تحتاج هذا الدور...'
                            })}
                            className="bg-white dark:bg-background"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Expertise & Interests */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{t({ en: 'Your Expertise & Interests', ar: 'خبراتك واهتماماتك' })}</h2>
                    <p className="text-muted-foreground">{t({ en: 'Select up to 5 in each category', ar: 'اختر حتى 5 في كل فئة' })}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      {t({ en: 'Areas of Expertise', ar: 'مجالات الخبرة' })}
                      <Badge variant="outline" className="ml-auto">{data.expertise_areas?.length || 0}/5</Badge>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERTISE_OPTIONS.map((item) => (
                        <Button
                          key={item.en}
                          type="button"
                          variant={data.expertise_areas?.includes(item.en) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleExpertise(item.en)}
                          className="rounded-full"
                        >
                          {item[language]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t({ en: 'Topics You Want to Follow', ar: 'المواضيع التي تريد متابعتها' })}
                      <Badge variant="outline" className="ml-auto">{data.interests?.length || 0}/5</Badge>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERTISE_OPTIONS.map((item) => (
                        <Button
                          key={item.en}
                          type="button"
                          variant={data.interests?.includes(item.en) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleInterest(item.en)}
                          className="rounded-full"
                        >
                          {item[language]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Feature Tour */}
              {step === 5 && selectedPersona && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{t({ en: 'Features for You', ar: 'مميزات لك' })}</h2>
                    <p className="text-muted-foreground">
                      {t({ en: 'Based on your profile, here are the key features', ar: 'بناءً على ملفك، إليك المميزات الرئيسية' })}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {selectedPersona.features.map((featureKey) => {
                      const feature = FEATURE_INFO[featureKey];
                      if (!feature) return null;
                      const Icon = feature.icon;
                      
                      return (
                        <div key={featureKey} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{feature.title[language]}</p>
                            <p className="text-sm text-muted-foreground">{feature.desc[language]}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 dark:bg-green-950/30 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      💡 {t({ 
                        en: 'Tip: You can always explore more features from the main navigation menu.',
                        ar: 'نصيحة: يمكنك دائمًا استكشاف المزيد من المميزات من القائمة الرئيسية.'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 6: Complete */}
              {step === 6 && (
                <div className="text-center space-y-4 py-8">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    {t({ en: "You're All Set!", ar: 'أنت جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    {t({ 
                      en: 'Your profile is ready. Start exploring opportunities!',
                      ar: 'ملفك جاهز. ابدأ باستكشاف الفرص!'
                    })}
                  </p>
                  
                  {data.requestRole && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 max-w-md mx-auto mt-6 dark:bg-blue-950/30 dark:border-blue-800">
                      <Send className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t({ 
                          en: 'Your role request has been submitted and will be reviewed.',
                          ar: 'تم إرسال طلب الدور وسيتم مراجعته.'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between pb-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
            
            <Button
              onClick={() => {
                if (step === steps.length) {
                  handleComplete();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={
                (step === 3 && !data.selectedPersona) ||
                updateProfileMutation.isPending
              }
              className="gap-2 min-w-[120px]"
            >
              {step === steps.length 
                ? (updateProfileMutation.isPending 
                    ? t({ en: 'Saving...', ar: 'جاري الحفظ...' })
                    : t({ en: 'Get Started', ar: 'ابدأ' }))
                : t({ en: 'Next', ar: 'التالي' })}
              {step !== steps.length && <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
