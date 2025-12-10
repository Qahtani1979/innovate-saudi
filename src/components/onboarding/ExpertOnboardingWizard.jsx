import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';
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
import FileUploader from '../FileUploader';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, 
  GraduationCap, Award, Briefcase, FileText, 
  Loader2, Upload, Star, Clock, Building2
} from 'lucide-react';
import { toast } from 'sonner';

const EXPERTISE_AREAS = [
  { en: 'Urban Planning', ar: 'التخطيط الحضري' },
  { en: 'Smart City Technologies', ar: 'تقنيات المدن الذكية' },
  { en: 'Sustainability & Environment', ar: 'الاستدامة والبيئة' },
  { en: 'Transportation & Mobility', ar: 'النقل والتنقل' },
  { en: 'Public Services', ar: 'الخدمات العامة' },
  { en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي والتعلم الآلي' },
  { en: 'Energy & Utilities', ar: 'الطاقة والمرافق' },
  { en: 'Healthcare Innovation', ar: 'ابتكار الرعاية الصحية' },
  { en: 'Education Technology', ar: 'تقنيات التعليم' },
  { en: 'Financial Technology', ar: 'التقنية المالية' },
  { en: 'Governance & Policy', ar: 'الحوكمة والسياسات' },
  { en: 'Digital Transformation', ar: 'التحول الرقمي' },
];

const STEPS = [
  { id: 1, title: { en: 'Basic Info', ar: 'معلومات أساسية' }, icon: Briefcase },
  { id: 2, title: { en: 'Expertise', ar: 'الخبرات' }, icon: GraduationCap },
  { id: 3, title: { en: 'Credentials', ar: 'المؤهلات' }, icon: Award },
  { id: 4, title: { en: 'Availability', ar: 'التوفر' }, icon: Clock },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

export default function ExpertOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    organization: '',
    years_of_experience: '',
    expertise_areas: [],
    certifications: [],
    cv_url: '',
    linkedin_url: '',
    bio: '',
    hourly_rate: '',
    availability_hours_per_week: '',
    preferred_engagement_types: [],
    languages: ['English'],
    portfolio_url: '',
    publications: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name || '',
        job_title: userProfile.job_title || '',
        organization: userProfile.organization || '',
        expertise_areas: userProfile.expertise_areas || [],
        cv_url: userProfile.cv_url || '',
        linkedin_url: userProfile.linkedin_url || '',
        bio: userProfile.bio || ''
      }));
    }
  }, [userProfile]);

  const progress = (currentStep / STEPS.length) * 100;

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
            years_of_experience: { type: 'number' },
            expertise_areas: { type: 'array', items: { type: 'string' } },
            certifications: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            linkedin_url: { type: 'string' }
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
          years_of_experience: output.years_of_experience?.toString() || prev.years_of_experience,
          expertise_areas: output.expertise_areas?.length > 0 ? output.expertise_areas.slice(0, 5) : prev.expertise_areas,
          certifications: output.certifications || prev.certifications,
          bio: output.bio || prev.bio,
          linkedin_url: output.linkedin_url || prev.linkedin_url
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

  const toggleExpertise = (expertise) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(expertise)
        ? prev.expertise_areas.filter(e => e !== expertise)
        : prev.expertise_areas.length < 5
          ? [...prev.expertise_areas, expertise]
          : prev.expertise_areas
    }));
  };

  const toggleEngagementType = (type) => {
    setFormData(prev => ({
      ...prev,
      preferred_engagement_types: prev.preferred_engagement_types.includes(type)
        ? prev.preferred_engagement_types.filter(t => t !== type)
        : [...prev.preferred_engagement_types, type]
    }));
  };

  const addCertification = () => {
    const cert = prompt(t({ en: 'Enter certification name:', ar: 'أدخل اسم الشهادة:' }));
    if (cert) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert]
      }));
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
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
          full_name: formData.full_name,
          job_title: formData.job_title,
          organization: formData.organization,
          bio: formData.bio,
          expertise_areas: formData.expertise_areas,
          cv_url: formData.cv_url,
          linkedin_url: formData.linkedin_url,
          onboarding_completed: true,
          persona_onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create expert profile if doesn't exist
      const { data: existingExpert } = await supabase
        .from('expert_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingExpert) {
        const { error: expertError } = await supabase
          .from('expert_profiles')
          .insert({
            user_id: user.id,
            user_email: user.email,
            full_name: formData.full_name,
            title: formData.job_title,
            organization: formData.organization,
            expertise_areas: formData.expertise_areas,
            certifications: formData.certifications,
            years_of_experience: parseInt(formData.years_of_experience) || 0,
            bio: formData.bio,
            cv_url: formData.cv_url,
            linkedin_url: formData.linkedin_url,
            hourly_rate: parseFloat(formData.hourly_rate) || null,
            availability_hours_per_week: parseInt(formData.availability_hours_per_week) || null,
            preferred_engagement_types: formData.preferred_engagement_types,
            languages: formData.languages,
            portfolio_url: formData.portfolio_url,
            status: 'pending_verification',
            is_available: true
          });

        if (expertError) {
          console.error('Expert profile error:', expertError);
        }
      }

      await checkAuth();
      toast.success(t({ en: 'Expert profile created!', ar: 'تم إنشاء ملف الخبير!' }));
      
      if (onComplete) {
        onComplete();
      } else {
        navigate(createPageUrl('ExpertRegistry'));
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(t({ en: 'Failed to save profile', ar: 'فشل في حفظ الملف الشخصي' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      await checkAuth();
      
      if (onSkip) {
        onSkip();
      } else {
        navigate(createPageUrl('Home'));
      }
    } catch (error) {
      console.error('Skip error:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">
                {t({ en: 'Become an Expert', ar: 'كن خبيراً' })}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t({ en: 'Share your expertise with municipalities', ar: 'شارك خبرتك مع البلديات' })}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t({ en: 'Upload CV/Resume', ar: 'تحميل السيرة الذاتية' })}</Label>
                <FileUploader
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                  value={formData.cv_url}
                  onChange={handleCVUpload}
                />
                {isExtractingCV && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t({ en: 'Extracting data from CV...', ar: 'جاري استخراج البيانات...' })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Full Name', ar: 'الاسم الكامل' })} *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder={t({ en: 'Dr. Ahmed Al-Farsi', ar: 'د. أحمد الفارسي' })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })} *</Label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder={t({ en: 'Senior Urban Planner', ar: 'مخطط حضري أول' })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Organization', ar: 'المنظمة' })}</Label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder={t({ en: 'King Saud University', ar: 'جامعة الملك سعود' })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })} *</Label>
                  <Input
                    type="number"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label>{t({ en: 'LinkedIn Profile', ar: 'ملف LinkedIn' })}</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {t({ en: 'Your Expertise', ar: 'خبراتك' })}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t({ en: 'Select up to 5 areas of expertise', ar: 'اختر حتى 5 مجالات خبرة' })}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPERTISE_AREAS.map((area) => (
                <button
                  key={area.en}
                  onClick={() => toggleExpertise(area.en)}
                  className={`p-3 rounded-lg border text-sm text-start transition-all ${
                    formData.expertise_areas.includes(area.en)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted border-border'
                  }`}
                >
                  {language === 'ar' ? area.ar : area.en}
                </button>
              ))}
            </div>

            <div className="text-sm text-muted-foreground text-center">
              {formData.expertise_areas.length}/5 {t({ en: 'selected', ar: 'مختار' })}
            </div>

            <div>
              <Label>{t({ en: 'Professional Bio', ar: 'نبذة مهنية' })}</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder={t({ 
                  en: 'Describe your professional background and expertise...', 
                  ar: 'صف خلفيتك المهنية وخبراتك...' 
                })}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {t({ en: 'Credentials & Certifications', ar: 'المؤهلات والشهادات' })}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t({ en: 'Add your professional certifications', ar: 'أضف شهاداتك المهنية' })}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                    <button
                      onClick={() => removeCertification(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              <Button variant="outline" onClick={addCertification} className="w-full">
                <Award className="h-4 w-4 mr-2" />
                {t({ en: 'Add Certification', ar: 'إضافة شهادة' })}
              </Button>

              <div>
                <Label>{t({ en: 'Portfolio/Website URL', ar: 'رابط الموقع/المعرض' })}</Label>
                <Input
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <Label>{t({ en: 'Notable Publications', ar: 'المنشورات البارزة' })}</Label>
                <Textarea
                  value={formData.publications}
                  onChange={(e) => setFormData(prev => ({ ...prev, publications: e.target.value }))}
                  placeholder={t({ 
                    en: 'List any academic papers, articles, or research publications...', 
                    ar: 'اذكر أي أوراق أكاديمية أو مقالات أو منشورات بحثية...' 
                  })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {t({ en: 'Availability & Preferences', ar: 'التوفر والتفضيلات' })}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t({ en: 'Set your availability for engagements', ar: 'حدد توفرك للمشاركات' })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'Hours Available per Week', ar: 'الساعات المتاحة أسبوعياً' })}</Label>
                <Input
                  type="number"
                  value={formData.availability_hours_per_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability_hours_per_week: e.target.value }))}
                  placeholder="10"
                  min="1"
                  max="40"
                />
              </div>
              <div>
                <Label>{t({ en: 'Hourly Rate (SAR)', ar: 'السعر بالساعة (ريال)' })}</Label>
                <Input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">{t({ en: 'Preferred Engagement Types', ar: 'أنواع المشاركة المفضلة' })}</Label>
              <div className="space-y-2">
                {[
                  { id: 'evaluation', label: { en: 'Proposal Evaluation', ar: 'تقييم المقترحات' } },
                  { id: 'mentorship', label: { en: 'Mentorship', ar: 'الإرشاد' } },
                  { id: 'consulting', label: { en: 'Consulting', ar: 'الاستشارات' } },
                  { id: 'workshops', label: { en: 'Workshops & Training', ar: 'ورش العمل والتدريب' } },
                  { id: 'research', label: { en: 'Research Collaboration', ar: 'التعاون البحثي' } }
                ].map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <Checkbox
                      id={type.id}
                      checked={formData.preferred_engagement_types.includes(type.id)}
                      onCheckedChange={() => toggleEngagementType(type.id)}
                    />
                    <Label htmlFor={type.id} className="font-normal cursor-pointer">
                      {language === 'ar' ? type.label.ar : type.label.en}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold">
                {t({ en: 'Profile Complete!', ar: 'اكتمل الملف!' })}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t({ en: 'Your expert profile is ready for review', ar: 'ملفك الخبير جاهز للمراجعة' })}
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{formData.full_name}</p>
                      <p className="text-sm text-muted-foreground">{formData.job_title}</p>
                    </div>
                  </div>
                  
                  {formData.organization && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <p>{formData.organization}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {formData.expertise_areas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))}
                    {formData.expertise_areas.length > 3 && (
                      <Badge variant="outline">+{formData.expertise_areas.length - 3}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Star className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {t({ en: 'What happens next?', ar: 'ماذا يحدث بعد ذلك؟' })}
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    {t({ 
                      en: 'Your profile will be reviewed by our team. Once verified, you\'ll receive expert assignments and evaluation requests.',
                      ar: 'سيتم مراجعة ملفك من قبل فريقنا. بمجرد التحقق، ستتلقى مهام خبير وطلبات تقييم.'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name && formData.job_title && formData.years_of_experience;
      case 2:
        return formData.expertise_areas.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-background p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {t({ en: `Step ${currentStep} of ${STEPS.length}`, ar: `الخطوة ${currentStep} من ${STEPS.length}` })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              {t({ en: 'Skip for now', ar: 'تخطي الآن' })}
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isComplete 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-1 hidden md:block ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {language === 'ar' ? step.title.ar : step.title.en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
            {t({ en: 'Back', ar: 'رجوع' })}
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
              {t({ en: 'Continue', ar: 'متابعة' })}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Complete Registration', ar: 'إكمال التسجيل' })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
