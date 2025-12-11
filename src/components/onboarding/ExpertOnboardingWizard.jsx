import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import FileUploader from '../FileUploader';
import { 
  Award, ArrowRight, ArrowLeft, CheckCircle2, 
  GraduationCap, Briefcase, Clock, Upload, FileText, 
  Loader2, Globe, Star, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'CV Import', ar: 'استيراد السيرة' }, icon: Upload },
  { id: 2, title: { en: 'Basic Info', ar: 'المعلومات الأساسية' }, icon: Briefcase },
  { id: 3, title: { en: 'Expertise', ar: 'الخبرات' }, icon: GraduationCap },
  { id: 4, title: { en: 'Availability', ar: 'التوفر' }, icon: Clock },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

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

const ENGAGEMENT_TYPES = [
  { id: 'evaluation', label: { en: 'Solution Evaluation', ar: 'تقييم الحلول' } },
  { id: 'advisory', label: { en: 'Advisory & Consulting', ar: 'الاستشارات' } },
  { id: 'mentoring', label: { en: 'Mentoring', ar: 'التوجيه' } },
  { id: 'jury', label: { en: 'Jury & Judging', ar: 'لجان التحكيم' } },
  { id: 'technical_review', label: { en: 'Technical Review', ar: 'المراجعة الفنية' } }
];

export default function ExpertOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
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
    portfolio_url: ''
  });

  // Pre-populate from Stage 1 onboarding data
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name_en || userProfile.full_name || prev.full_name,
        job_title: userProfile.job_title_en || userProfile.job_title || prev.job_title,
        organization: userProfile.organization_en || userProfile.organization || prev.organization,
        expertise_areas: userProfile.expertise_areas || prev.expertise_areas,
        cv_url: userProfile.cv_url || prev.cv_url,
        linkedin_url: userProfile.linkedin_url || prev.linkedin_url,
        bio: userProfile.bio_en || userProfile.bio || prev.bio
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
      toast.info(t({ en: 'CV uploaded. Please fill in details manually.', ar: 'تم رفع السيرة الذاتية. يرجى ملء التفاصيل يدوياً.' }));
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
          full_name_en: formData.full_name,
          job_title: formData.job_title,
          job_title_en: formData.job_title,
          organization: formData.organization,
          organization_en: formData.organization,
          bio: formData.bio,
          bio_en: formData.bio,
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
        await supabase
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
      }

      await queryClient.invalidateQueries(['user-profile']);
      if (checkAuth) await checkAuth();
      
      toast.success(t({ en: 'Expert profile created!', ar: 'تم إنشاء ملف الخبير!' }));
      onComplete?.(formData);
      navigate(createPageUrl('ExpertRegistry'));
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(t({ en: 'Failed to save profile', ar: 'فشل في حفظ الملف الشخصي' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      await checkAuth();
      onSkip?.();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Skip error:', error);
      onSkip?.();
      navigate(createPageUrl('Home'));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // CV is optional
      case 2: return formData.full_name.trim() !== '' && formData.years_of_experience !== '';
      case 3: return formData.expertise_areas.length > 0;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900/95 via-slate-900/95 to-orange-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header with Language Toggle */}
          <div className="text-center text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24" />
              <div className="flex items-center gap-2">
                <Award className="h-8 w-8 text-amber-400" />
                <h1 className="text-2xl font-bold">
                  {t({ en: 'Expert Profile Setup', ar: 'إعداد ملف الخبير' })}
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
              {t({ en: 'Share your expertise with municipalities', ar: 'شارك خبرتك مع البلديات' })}
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
                        isActive ? 'bg-amber-600 text-white' : 
                        isComplete ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60'
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

          {/* Step 1: CV Import */}
          {currentStep === 1 && (
            <Card className="border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Import CV (Optional)', ar: 'استيراد السيرة الذاتية (اختياري)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-dashed border-amber-200 rounded-lg bg-amber-50/50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-10 w-10 text-amber-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-1">
                        {t({ en: 'Upload Your CV', ar: 'رفع سيرتك الذاتية' })}
                      </h3>
                      <p className="text-sm text-amber-700 mb-3">
                        {t({ en: 'AI will extract your expertise, certifications, and experience', ar: 'سيستخرج الذكاء الاصطناعي خبراتك وشهاداتك وتجربتك' })}
                      </p>
                      <FileUploader
                        onUploadComplete={handleCVUpload}
                        type="document"
                        label={t({ en: 'Upload CV (PDF, DOCX)', ar: 'رفع السيرة الذاتية (PDF, DOCX)' })}
                        maxSize={10}
                      />
                      {isExtractingCV && (
                        <div className="flex items-center gap-2 mt-3 text-amber-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t({ en: 'AI is extracting your information...', ar: 'الذكاء الاصطناعي يستخرج معلوماتك...' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {formData.cv_url && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{t({ en: 'CV uploaded and processed!', ar: 'تم رفع ومعالجة السيرة الذاتية!' })}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <Card className="border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ en: 'Full Name', ar: 'الاسم الكامل' })} *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder={t({ en: 'Dr. Ahmed Al-Farsi', ar: 'د. أحمد الفارسي' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</Label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      placeholder={t({ en: 'Senior Urban Planner', ar: 'مخطط حضري أول' })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ en: 'Organization', ar: 'المنظمة' })}</Label>
                    <Input
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={t({ en: 'King Saud University', ar: 'جامعة الملك سعود' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })} *</Label>
                    <Input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                      placeholder="10"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t({ en: 'LinkedIn Profile', ar: 'ملف LinkedIn' })}</Label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Professional Bio', ar: 'نبذة مهنية' })}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t({ en: 'Describe your professional background...', ar: 'صف خلفيتك المهنية...' })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Expertise */}
          {currentStep === 3 && (
            <Card className="border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Expertise & Credentials', ar: 'الخبرات والمؤهلات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Areas of Expertise (select up to 5)', ar: 'مجالات الخبرة (اختر حتى 5)' })} *
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {EXPERTISE_AREAS.map((area) => (
                      <button
                        key={area.en}
                        onClick={() => toggleExpertise(area.en)}
                        className={`p-3 rounded-lg border text-sm text-start transition-all ${
                          formData.expertise_areas.includes(area.en)
                            ? 'bg-amber-100 border-amber-500 text-amber-900'
                            : 'border-border hover:border-amber-300'
                        }`}
                      >
                        {language === 'ar' ? area.ar : area.en}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground text-center mt-2">
                    {formData.expertise_areas.length}/5 {t({ en: 'selected', ar: 'مختار' })}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">{t({ en: 'Certifications', ar: 'الشهادات' })}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        {cert}
                        <button
                          onClick={() => removeCertification(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Certification', ar: 'إضافة شهادة' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <Card className="border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Availability & Engagement', ar: 'التوفر والمشاركة' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ en: 'Hourly Rate (SAR)', ar: 'الأجر بالساعة (ريال)' })}</Label>
                    <Input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Hours/Week Available', ar: 'ساعات متاحة/أسبوع' })}</Label>
                    <Input
                      type="number"
                      value={formData.availability_hours_per_week}
                      onChange={(e) => setFormData({ ...formData, availability_hours_per_week: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">{t({ en: 'Preferred Engagement Types', ar: 'أنواع المشاركة المفضلة' })}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ENGAGEMENT_TYPES.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => toggleEngagementType(type.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.preferred_engagement_types.includes(type.id)
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-border hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Star className={`h-4 w-4 ${formData.preferred_engagement_types.includes(type.id) ? 'text-amber-600' : 'text-muted-foreground'}`} />
                          <span className="text-sm">{type.label[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t({ en: 'Portfolio URL', ar: 'رابط المعرض' })}</Label>
                  <Input
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <Card className="border-2 border-amber-300">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    {t({ en: 'Expert Profile Ready!', ar: 'ملف الخبير جاهز!' })}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t({
                      en: 'Your expert profile will be reviewed. You\'ll be notified when you\'re matched with evaluation opportunities.',
                      ar: 'سيتم مراجعة ملف الخبير الخاص بك. سيتم إعلامك عند مطابقتك مع فرص التقييم.'
                    })}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <Badge variant="outline" className="text-sm">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {formData.expertise_areas.length} {t({ en: 'Expertise Areas', ar: 'مجالات خبرة' })}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Award className="w-3 h-3 mr-1" />
                      {formData.certifications.length} {t({ en: 'Certifications', ar: 'شهادات' })}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {formData.availability_hours_per_week || '?'} {t({ en: 'hrs/week', ar: 'ساعة/أسبوع' })}
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
                className="bg-amber-600 hover:bg-amber-700"
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
                    {t({ en: 'Create Expert Profile', ar: 'إنشاء ملف الخبير' })}
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