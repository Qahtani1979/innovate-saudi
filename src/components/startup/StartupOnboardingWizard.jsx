import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useRegions, useStartupOnboardingMutations } from '../../hooks/useStartupOnboarding';
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
  Building2, Target, Globe, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'Company Info', ar: 'معلومات الشركة' }, icon: Building2 },
  { id: 2, title: { en: 'Sectors', ar: 'القطاعات' }, icon: Target },
  { id: 3, title: { en: 'Coverage', ar: 'التغطية' }, icon: Globe },
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

export default function StartupOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    linkedin_url: '',
    cv_url: ''
  });

  // Fetch regions for geographic coverage
  const { submitOnboarding } = useStartupOnboardingMutations();

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
        cv_url: userProfile.cv_url || prev.cv_url,
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

    setIsSubmitting(true);

    submitOnboarding.mutate({
      userId: user.id,
      userEmail: user.email,
      formData
    }, {
      onSuccess: () => {
        toast.success(t({ en: 'Startup profile created! Welcome aboard!', ar: 'تم إنشاء ملف الشركة! مرحباً بك!' }));
        onComplete?.(formData);
        navigate(createPageUrl('StartupDashboard'));
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Onboarding error:', error);
        toast.error(t({ en: 'Failed to complete setup', ar: 'فشل في إكمال الإعداد' }));
        setIsSubmitting(false);
      }
    });
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

          {/* Header */}
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Rocket className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold">
                {t({ en: 'Solution Provider Setup', ar: 'إعداد مزود الحلول' })}
              </h1>
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
                          <Checkbox checked={formData.sectors.includes(sector.id)} />
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
                          <Checkbox checked={formData.challenge_interests.includes(type.id)} />
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
                  <Globe className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Geographic Coverage', ar: 'التغطية الجغرافية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Which regions can you serve?', ar: 'أي المناطق يمكنك خدمتها؟' })}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
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
                          <Checkbox checked={formData.geographic_coverage.includes(region.id)} />
                          <span className="text-sm">{language === 'ar' ? region.name_ar : region.name_en}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Completion */}
          {currentStep === 4 && (
            <Card className="border-2 border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Ready to Launch!', ar: 'جاهز للإطلاق!' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800">
                    {t({
                      en: "You'll get AI-matched to relevant municipal challenges and opportunities. Our platform will help you connect with the right municipalities for your solutions.",
                      ar: 'ستحصل على مطابقة ذكية مع التحديات والفرص البلدية ذات الصلة. ستساعدك منصتنا على التواصل مع البلديات المناسبة لحلولك.'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">{t({ en: 'Your Profile Summary', ar: 'ملخص ملفك' })}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted rounded">
                      <span className="text-muted-foreground">{t({ en: 'Company', ar: 'الشركة' })}: </span>
                      <span className="font-medium">{formData.company_name_en || '-'}</span>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <span className="text-muted-foreground">{t({ en: 'Stage', ar: 'المرحلة' })}: </span>
                      <span className="font-medium capitalize">{formData.stage.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <span className="text-muted-foreground">{t({ en: 'Team', ar: 'الفريق' })}: </span>
                      <span className="font-medium">{formData.team_size} {t({ en: 'people', ar: 'شخص' })}</span>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <span className="text-muted-foreground">{t({ en: 'Sectors', ar: 'القطاعات' })}: </span>
                      <span className="font-medium">{formData.sectors.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t({ en: 'Back', ar: 'رجوع' })}
                </Button>
              )}
              {onSkip && currentStep === 1 && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  {t({ en: 'Skip for now', ar: 'تخطي الآن' })}
                </Button>
              )}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t({ en: 'Continue', ar: 'متابعة' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
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