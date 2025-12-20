import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useAutoRoleAssignment } from '@/hooks/useAutoRoleAssignment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { 
  Shield, ArrowRight, ArrowLeft, CheckCircle2, 
  Building2, Target, BarChart3, Layers, Map, Globe, Loader2, Activity
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'Welcome', ar: 'مرحباً' }, icon: Shield },
  { id: 2, title: { en: 'Profile', ar: 'الملف الشخصي' }, icon: Building2 },
  { id: 3, title: { en: 'Sectors', ar: 'القطاعات' }, icon: Layers },
  { id: 4, title: { en: 'Oversight', ar: 'الإشراف' }, icon: Map },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

const OVERSIGHT_CAPABILITIES = [
  { id: 'cross_municipal', icon: Map, title: { en: 'Cross-Municipal Oversight', ar: 'الإشراف عبر البلديات' }, desc: { en: 'View challenges and pilots across all municipalities', ar: 'عرض التحديات والتجارب عبر جميع البلديات' } },
  { id: 'strategic_guidance', icon: Target, title: { en: 'Strategic Guidance', ar: 'التوجيه الاستراتيجي' }, desc: { en: 'Publish national guidance and best practices', ar: 'نشر التوجيهات الوطنية وأفضل الممارسات' } },
  { id: 'benchmarking', icon: BarChart3, title: { en: 'Benchmarking', ar: 'المقارنة المعيارية' }, desc: { en: 'Compare performance across municipalities', ar: 'مقارنة الأداء عبر البلديات' } },
  { id: 'sector_analytics', icon: Activity, title: { en: 'Sector Analytics', ar: 'تحليلات القطاع' }, desc: { en: 'Access comprehensive sector-level analytics', ar: 'الوصول إلى تحليلات شاملة على مستوى القطاع' } },
];

export default function DeputyshipOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkAndAssignRole } = useAutoRoleAssignment();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    job_title: '',
    department: '',
    phone: '',
    bio: '',
    selectedSectors: [],
    focusAreas: []
  });

  // Fetch sectors
  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, icon')
        .eq('is_active', true)
        .order('name_en');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch municipalities count
  const { data: municipalitiesCount = 0 } = useQuery({
    queryKey: ['municipalities-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('municipalities')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) return 0;
      return count || 0;
    }
  });

  // Pre-populate from Stage 1 onboarding data
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        job_title: userProfile.job_title_en || userProfile.job_title || prev.job_title,
        department: userProfile.department_en || userProfile.department || prev.department,
        phone: userProfile.work_phone || prev.phone,
        bio: userProfile.bio_en || userProfile.bio || prev.bio,
        selectedSectors: userProfile.expertise_areas?.length > 0 ? userProfile.expertise_areas : prev.selectedSectors,
      }));
    }
  }, [userProfile]);

  const progress = (currentStep / STEPS.length) * 100;

  const toggleSector = (sectorId) => {
    setFormData(prev => ({
      ...prev,
      selectedSectors: prev.selectedSectors.includes(sectorId)
        ? prev.selectedSectors.filter(id => id !== sectorId)
        : [...prev.selectedSectors, sectorId]
    }));
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(t({ en: 'User not found', ar: 'المستخدم غير موجود' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          job_title: formData.job_title || null,
          job_title_en: formData.job_title || null,
          department: formData.department || null,
          department_en: formData.department || null,
          work_phone: formData.phone || null,
          bio: formData.bio || null,
          bio_en: formData.bio || null,
          expertise_areas: formData.selectedSectors,
          onboarding_completed: true,
          persona_onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          metadata: {
            oversight_scope: 'national',
            focus_sectors: formData.selectedSectors
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Check auto-approval for deputyship role (usually requires MoMAH email domain)
      const roleResult = await checkAndAssignRole({
        userId: user.id,
        userEmail: user.email,
        personaType: 'deputyship',
        justification: 'Deputyship onboarding completed',
        language
      });

      await queryClient.invalidateQueries(['user-profile']);
      if (checkAuth) await checkAuth();

      if (roleResult.autoApproved) {
        toast.success(t({ en: 'Deputyship role approved! Welcome to national oversight.', ar: 'تمت الموافقة على دور الوكالة! مرحباً بك في الإشراف الوطني.' }));
      } else {
        toast.info(t({ en: 'Deputyship profile complete! Role pending approval.', ar: 'تم إكمال ملف الوكالة! الدور في انتظار الموافقة.' }));
      }

      onComplete?.(formData);
      navigate(createPageUrl('ExecutiveDashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t({ en: 'Failed to complete setup', ar: 'فشل في إكمال الإعداد' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      sessionStorage.setItem('deputyship_wizard_skipped', Date.now().toString());
      toast.info(t({ 
        en: 'You can complete your profile anytime from settings.', 
        ar: 'يمكنك إكمال ملفك الشخصي في أي وقت من الإعدادات.' 
      }));
      onSkip?.();
      navigate(createPageUrl('ExecutiveDashboard'));
    } catch (error) {
      console.error('Skip error:', error);
      onSkip?.();
      navigate(createPageUrl('ExecutiveDashboard'));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return formData.job_title.trim() !== '';
      case 3: return formData.selectedSectors.length > 0;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/95 via-slate-900/95 to-purple-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header with Language Toggle */}
          <div className="text-center text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24" />
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-indigo-400" />
                <h1 className="text-2xl font-bold">
                  {t({ en: 'Deputyship Profile Setup', ar: 'إعداد ملف الوكالة' })}
                </h1>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLanguage}
                className="text-white/70 hover:text-white hover:bg-white/10 font-medium w-24"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === 'en' ? 'عربي' : 'English'}
              </Button>
            </div>
            <p className="text-white/60">
              {t({ en: 'National oversight of municipal innovation', ar: 'الإشراف الوطني على الابتكار البلدي' })}
            </p>
          </div>

          {/* Progress */}
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <Badge className={`px-3 py-2 border-0 ${
                        isActive ? 'bg-indigo-600 text-white' : 
                        isComplete ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        <StepIcon className="h-4 w-4 mr-1" />
                        {step.title[language]}
                      </Badge>
                      {index < STEPS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-white/30" />
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
            <Card className="border-2 border-indigo-300">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    {t({ en: 'Welcome to the Deputyship Portal', ar: 'مرحباً بك في بوابة الوكالة' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({
                      en: 'As a deputyship member, you have national-level oversight of municipal innovation across your sector focus areas.',
                      ar: 'كعضو في الوكالة، لديك إشراف على المستوى الوطني على الابتكار البلدي في مجالات تركيز قطاعك.'
                    })}
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <Building2 className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                      <div className="text-2xl font-bold text-indigo-900">{municipalitiesCount}</div>
                      <div className="text-xs text-indigo-700">{t({ en: 'Municipalities', ar: 'البلديات' })}</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Layers className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-900">{sectors.length}</div>
                      <div className="text-xs text-purple-700">{t({ en: 'Sectors', ar: 'القطاعات' })}</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <Globe className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                      <div className="text-2xl font-bold text-indigo-900">13</div>
                      <div className="text-xs text-indigo-700">{t({ en: 'Regions', ar: 'المناطق' })}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profile */}
          {currentStep === 2 && (
            <Card className="border-2 border-indigo-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  {t({ en: 'Your Profile', ar: 'ملفك الشخصي' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })} *</Label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder={t({ en: 'e.g., Deputy Director of Innovation', ar: 'مثال: نائب مدير الابتكار' })}
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Department / Deputyship', ar: 'الإدارة / الوكالة' })}</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder={t({ en: 'e.g., Strategy & Innovation Deputyship', ar: 'مثال: وكالة الاستراتيجية والابتكار' })}
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Phone', ar: 'الهاتف' })}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Bio', ar: 'نبذة' })}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t({ en: 'Brief description of your role and expertise...', ar: 'وصف موجز لدورك وخبرتك...' })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Sectors */}
          {currentStep === 3 && (
            <Card className="border-2 border-indigo-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  {t({ en: 'Sector Focus', ar: 'تركيز القطاع' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Select the sectors you oversee or specialize in', ar: 'اختر القطاعات التي تشرف عليها أو تتخصص فيها' })}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sectors.map((sector) => (
                    <div
                      key={sector.id}
                      onClick={() => toggleSector(sector.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selectedSectors.includes(sector.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-border hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{sector.icon || '🏢'}</div>
                      <div className="font-medium text-sm">
                        {language === 'ar' ? sector.name_ar : sector.name_en}
                      </div>
                      {formData.selectedSectors.includes(sector.id) && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {t({ en: `${formData.selectedSectors.length} sector(s) selected`, ar: `تم اختيار ${formData.selectedSectors.length} قطاع` })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Oversight Capabilities */}
          {currentStep === 4 && (
            <Card className="border-2 border-indigo-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-indigo-600" />
                  {t({ en: 'Your Oversight Capabilities', ar: 'صلاحيات الإشراف' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {OVERSIGHT_CAPABILITIES.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium">{t(item.title)}</div>
                      <div className="text-sm text-muted-foreground">{t(item.desc)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <Card className="border-2 border-indigo-300">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    {t({ en: "You're All Set!", ar: 'أنت جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({
                      en: 'Your deputyship profile is complete. Access your executive dashboard to oversee innovation across municipalities.',
                      ar: 'تم إكمال ملف الوكالة الخاص بك. يمكنك الآن الوصول إلى لوحة التحكم التنفيذية.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <Badge variant="outline" className="text-sm">
                      <Building2 className="w-3 h-3 mr-1" />
                      {t({ en: 'All Municipalities Access', ar: 'الوصول لجميع البلديات' })}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Layers className="w-3 h-3 mr-1" />
                      {formData.selectedSectors.length} {t({ en: 'Sectors', ar: 'قطاعات' })}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Shield className="w-3 h-3 mr-1" />
                      {t({ en: 'National Oversight', ar: 'إشراف وطني' })}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t({ en: 'Previous', ar: 'السابق' })}
                </Button>
              )}
              {currentStep === 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  {t({ en: 'Skip for now', ar: 'تخطي الآن' })}
                </Button>
              )}
            </div>

            {currentStep < STEPS.length ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Completing...', ar: 'جاري الإكمال...' })}
                  </>
                ) : (
                  <>
                    {t({ en: 'Go to Dashboard', ar: 'انتقل للوحة التحكم' })}
                    <ArrowRight className="h-4 w-4 ml-2" />
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