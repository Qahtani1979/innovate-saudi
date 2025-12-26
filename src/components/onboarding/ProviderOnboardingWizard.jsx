import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAutoRoleAssignment } from '@/hooks/useAutoRoleAssignment';
import { useOnboardingMutations } from '@/hooks/useOnboardingMutations';
import { useRegions } from '@/hooks/useRegions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import {
  Rocket, ArrowRight, ArrowLeft, CheckCircle2,
  Building2, Target, Globe, Loader2, Map
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'Company Info', ar: 'معلومات الشركة' }, icon: Building2 },
  { id: 2, title: { en: 'Sectors', ar: 'القطاعات' }, icon: Target },
  { id: 3, title: { en: 'Coverage', ar: 'التغطية' }, icon: Map },
  { id: 4, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

const SECTOR_OPTIONS = [
  { id: 'urban_design', label: { en: 'Urban Design', ar: 'التصميم الحضري' } },
  { id: 'transport', label: { en: 'Transportation', ar: 'النقل' } },
  { id: 'environment', label: { en: 'Environment', ar: 'البيئة' } },
  { id: 'digital_services', label: { en: 'Digital Services', ar: 'الخدمات الرقمية' } },
  { id: 'health', label: { en: 'Healthcare', ar: 'الرعاية الصحية' } },
  { id: 'education', label: { en: 'Education', ar: 'التعليم' } },
  { id: 'safety', label: { en: 'Public Safety', ar: 'السلامة العامة' } },
  { id: 'energy', label: { en: 'Energy & Utilities', ar: 'الطاقة والمرافق' } },
  { id: 'smart_city', label: { en: 'Smart City', ar: 'المدينة الذكية' } },
  { id: 'fintech', label: { en: 'FinTech', ar: 'التقنية المالية' } }
];

const CHALLENGE_TYPES = [
  { id: 'service_quality', label: { en: 'Service Quality', ar: 'جودة الخدمة' } },
  { id: 'infrastructure', label: { en: 'Infrastructure', ar: 'البنية التحتية' } },
  { id: 'efficiency', label: { en: 'Operational Efficiency', ar: 'الكفاءة التشغيلية' } },
  { id: 'innovation', label: { en: 'Digital Innovation', ar: 'الابتكار الرقمي' } },
  { id: 'safety', label: { en: 'Safety & Security', ar: 'السلامة والأمان' } },
  { id: 'environmental', label: { en: 'Environmental', ar: 'البيئة' } }
];

const STAGES = [
  { id: 'idea', label: { en: 'Idea Stage', ar: 'مرحلة الفكرة' } },
  { id: 'pre_seed', label: { en: 'Pre-Seed', ar: 'ما قبل التمويل' } },
  { id: 'seed', label: { en: 'Seed', ar: 'التمويل الأولي' } },
  { id: 'series_a', label: { en: 'Series A', ar: 'الجولة أ' } },
  { id: 'growth', label: { en: 'Growth', ar: 'النمو' } },
  { id: 'scale', label: { en: 'Scale', ar: 'التوسع' } }
];

export default function ProviderOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();

  const navigate = useNavigate();
  const { checkAndAssignRole } = useAutoRoleAssignment();
  const { upsertProfile } = useOnboardingMutations();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name_en: '',
    company_name_ar: '',
    description_en: '',
    description_ar: '',
    stage: 'seed',
    team_size: 5,
    sectors: [],
    challenge_interests: [],
    geographic_coverage: [],
    website: '',
    linkedin_url: ''
  });

  // Fetch regions for geographic coverage
  const { data: regions = [] } = useRegions();

  // Pre-populate from Stage 1 onboarding data
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        company_name_en: userProfile.organization_en || prev.company_name_en,
        company_name_ar: userProfile.organization_ar || prev.company_name_ar,
        description_en: userProfile.bio_en || prev.description_en,
        description_ar: userProfile.bio_ar || prev.description_ar,
        sectors: userProfile.expertise_areas?.length > 0 ? userProfile.expertise_areas : prev.sectors,
        linkedin_url: userProfile.linkedin_url || prev.linkedin_url,
        website: userProfile.website || prev.website,
      }));
    }
  }, [userProfile]);

  const progress = (currentStep / STEPS.length) * 100;

  const toggleSector = (id) => {
    const current = formData.sectors;
    if (current.includes(id)) {
      setFormData({ ...formData, sectors: current.filter(s => s !== id) });
    } else if (current.length < 5) {
      setFormData({ ...formData, sectors: [...current, id] });
    }
  };

  const toggleChallengeInterest = (id) => {
    const current = formData.challenge_interests;
    if (current.includes(id)) {
      setFormData({ ...formData, challenge_interests: current.filter(c => c !== id) });
    } else {
      setFormData({ ...formData, challenge_interests: [...current, id] });
    }
  };

  const toggleRegion = (id) => {
    const current = formData.geographic_coverage;
    if (current.includes(id)) {
      setFormData({ ...formData, geographic_coverage: current.filter(r => r !== id) });
    } else {
      setFormData({ ...formData, geographic_coverage: [...current, id] });
    }
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(t({ en: 'User not found', ar: 'المستخدم غير موجود' }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user profile with provider data
      // Update user profile with provider data
      await upsertProfile.mutateAsync({
        table: 'user_profiles',
        matchingColumns: ['user_id'],
        data: {
          user_id: user.id,
          organization_en: formData.company_name_en || null,
          organization_ar: formData.company_name_ar || null,
          bio_en: formData.description_en || null,
          bio_ar: formData.description_ar || null,
          expertise_areas: formData.sectors,
          linkedin_url: formData.linkedin_url || null,
          onboarding_completed: true,
          persona_onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          metadata: {
            company_stage: formData.stage,
            team_size: formData.team_size,
            challenge_interests: formData.challenge_interests,
            geographic_coverage: formData.geographic_coverage
          },
          updated_at: new Date().toISOString()
        }
      });

      // Create or update provider profile
      const providerData = {
        user_id: user.id,
        user_email: user.email,
        company_name_en: formData.company_name_en,
        company_name_ar: formData.company_name_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        company_stage: formData.stage,
        team_size: formData.team_size,
        sectors: formData.sectors,
        challenge_interests: formData.challenge_interests,
        geographic_coverage: formData.geographic_coverage,
        website: formData.website,
        linkedin_url: formData.linkedin_url,
        is_verified: false,
        status: 'pending_verification'
      };

      await upsertProfile.mutateAsync({
        table: 'providers',
        matchingColumns: ['user_id'],
        data: providerData
      });

      // Auto-assign role or create pending request
      const roleResult = await checkAndAssignRole({
        userId: user.id,
        userEmail: user.email,
        personaType: 'provider',
        justification: 'Provider onboarding completed',
        language
      });

      if (roleResult.autoApproved) {
        toast.success(t({ en: 'Provider role approved! Welcome aboard!', ar: 'تمت الموافقة على دور المزود! مرحباً بك!' }));
      } else {
        toast.info(t({ en: 'Provider profile created! Role pending approval.', ar: 'تم إنشاء ملف المزود! الدور في انتظار الموافقة.' }));
      }


      if (checkAuth) await checkAuth();

      onComplete?.(formData);
      navigate(createPageUrl('StartupDashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t({ en: 'Failed to complete setup', ar: 'فشل في إكمال الإعداد' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      sessionStorage.setItem('provider_wizard_skipped', Date.now().toString());
      toast.info(t({
        en: 'You can complete your profile anytime from settings.',
        ar: 'يمكنك إكمال ملفك الشخصي في أي وقت من الإعدادات.'
      }));
      onSkip?.();
      navigate(createPageUrl('StartupDashboard'));
    } catch (error) {
      console.error('Skip error:', error);
      onSkip?.();
      navigate(createPageUrl('StartupDashboard'));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.company_name_en.trim() !== '';
      case 2: return formData.sectors.length > 0;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-slate-900/95 to-indigo-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header with Language Toggle */}
          <div className="text-center text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24" />
              <div className="flex items-center gap-2">
                <Rocket className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold">
                  {t({ en: 'Solution Provider Setup', ar: 'إعداد مزود الحلول' })}
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
              {t({ en: 'Connect with municipalities and unlock opportunities', ar: 'تواصل مع البلديات واكتشف الفرص' })}
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
                      <Badge className={`px-3 py-2 border-0 ${isActive ? 'bg-blue-600 text-white' :
                        isComplete ? 'bg-green-600 text-white' : 'bg-white/10 text-white/60'
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

          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Company Information', ar: 'معلومات الشركة' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ en: 'Company Name (English)', ar: 'اسم الشركة (إنجليزي)' })} *</Label>
                    <Input
                      value={formData.company_name_en}
                      onChange={(e) => setFormData({ ...formData, company_name_en: e.target.value })}
                      placeholder={t({ en: 'Your company name', ar: 'اسم شركتك' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Company Name (Arabic)', ar: 'اسم الشركة (عربي)' })}</Label>
                    <Input
                      value={formData.company_name_ar}
                      onChange={(e) => setFormData({ ...formData, company_name_ar: e.target.value })}
                      placeholder={t({ en: 'اسم الشركة', ar: 'اسم الشركة' })}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                    placeholder={t({ en: 'What does your company do?', ar: 'ماذا تفعل شركتك؟' })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ en: 'Stage', ar: 'المرحلة' })}</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) => setFormData({ ...formData, stage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.label[language]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t({ en: 'Team Size', ar: 'حجم الفريق' })}</Label>
                    <Input
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t({ en: 'Website', ar: 'الموقع الإلكتروني' })}</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Sectors & Interests */}
          {currentStep === 2 && (
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Sectors & Interests', ar: 'القطاعات والاهتمامات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Select your sectors (max 5)', ar: 'اختر قطاعاتك (حد أقصى 5)' })} *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTOR_OPTIONS.map((sector) => (
                      <div
                        key={sector.id}
                        onClick={() => toggleSector(sector.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.sectors.includes(sector.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-border hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={formData.sectors.includes(sector.id)} readOnly />
                          <span className="text-sm">{sector.label[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Challenge types you can address', ar: 'أنواع التحديات التي يمكنك معالجتها' })}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHALLENGE_TYPES.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => toggleChallengeInterest(type.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.challenge_interests.includes(type.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-border hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={formData.challenge_interests.includes(type.id)} readOnly />
                          <span className="text-sm">{type.label[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Geographic Coverage */}
          {currentStep === 3 && (
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Geographic Coverage', ar: 'التغطية الجغرافية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Select regions where you can provide services', ar: 'اختر المناطق التي يمكنك تقديم خدماتك فيها' })}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {regions.map((region) => (
                    <div
                      key={region.id}
                      onClick={() => toggleRegion(region.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.geographic_coverage.includes(region.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={formData.geographic_coverage.includes(region.id)} readOnly />
                        <span className="text-sm">{language === 'ar' ? region.name_ar : region.name_en}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t({
                    en: 'Leave empty if you can serve all regions',
                    ar: 'اتركها فارغة إذا كنت تستطيع خدمة جميع المناطق'
                  })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <Card className="border-2 border-blue-300">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    {t({ en: 'Welcome Aboard!', ar: 'مرحباً بك!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({
                      en: 'Your provider profile is ready. Start exploring challenges and opportunities from municipalities.',
                      ar: 'ملف المزود الخاص بك جاهز. ابدأ استكشاف التحديات والفرص من البلديات.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <Badge variant="outline" className="text-sm">
                      <Target className="w-3 h-3 mr-1" />
                      {formData.sectors.length} {t({ en: 'Sectors', ar: 'قطاعات' })}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Map className="w-3 h-3 mr-1" />
                      {formData.geographic_coverage.length || 'All'} {t({ en: 'Regions', ar: 'مناطق' })}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Rocket className="w-3 h-3 mr-1" />
                      {STAGES.find(s => s.id === formData.stage)?.label[language]}
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
                className="bg-blue-600 hover:bg-blue-700"
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
                    {t({ en: 'Creating Profile...', ar: 'جاري إنشاء الملف...' })}
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