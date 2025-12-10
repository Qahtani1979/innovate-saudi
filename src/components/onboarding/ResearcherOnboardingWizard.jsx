import React, { useState } from 'react';
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
import { 
  FlaskConical, ArrowRight, ArrowLeft, CheckCircle2, 
  GraduationCap, BookOpen, Link2, Loader2, Sparkles, Upload, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'CV Import', ar: 'استيراد السيرة' }, icon: Upload },
  { id: 2, title: { en: 'Institution', ar: 'المؤسسة' }, icon: GraduationCap },
  { id: 3, title: { en: 'Research', ar: 'البحث' }, icon: FlaskConical },
  { id: 4, title: { en: 'Links', ar: 'الروابط' }, icon: Link2 },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

const RESEARCH_AREAS = [
  { en: 'Urban Planning & Development', ar: 'التخطيط والتنمية الحضرية' },
  { en: 'Smart Cities & IoT', ar: 'المدن الذكية وإنترنت الأشياء' },
  { en: 'Sustainability & Environment', ar: 'الاستدامة والبيئة' },
  { en: 'Transportation & Mobility', ar: 'النقل والتنقل' },
  { en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي وتعلم الآلة' },
  { en: 'Data Science & Analytics', ar: 'علم البيانات والتحليلات' },
  { en: 'Public Policy', ar: 'السياسة العامة' },
  { en: 'Energy & Utilities', ar: 'الطاقة والمرافق' },
  { en: 'Healthcare Innovation', ar: 'الابتكار الصحي' },
  { en: 'Social Innovation', ar: 'الابتكار الاجتماعي' }
];

const COLLABORATION_TYPES = [
  { id: 'joint_research', label: { en: 'Joint Research Projects', ar: 'مشاريع بحثية مشتركة' } },
  { id: 'consulting', label: { en: 'Consulting & Advisory', ar: 'الاستشارات والمشورة' } },
  { id: 'evaluation', label: { en: 'Pilot Evaluation', ar: 'تقييم التجارب' } },
  { id: 'training', label: { en: 'Training & Workshops', ar: 'التدريب وورش العمل' } },
  { id: 'data_sharing', label: { en: 'Data Sharing', ar: 'مشاركة البيانات' } }
];

export default function ResearcherOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  
  const [formData, setFormData] = useState({
    cv_url: '',
    institution: '',
    department: '',
    academic_title: '',
    research_areas: [],
    collaboration_types: [],
    orcid_id: '',
    google_scholar_url: '',
    researchgate_url: '',
    publications_count: 0,
    bio: ''
  });

  // Pre-populate from Stage 1 onboarding data
  React.useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        cv_url: userProfile.cv_url || prev.cv_url,
        institution: userProfile.organization_en || userProfile.organization || prev.institution,
        department: userProfile.department_en || userProfile.department || prev.department,
        academic_title: userProfile.job_title_en || userProfile.job_title || prev.academic_title,
        research_areas: userProfile.expertise_areas?.length > 0 ? userProfile.expertise_areas : prev.research_areas,
        bio: userProfile.bio_en || userProfile.bio || prev.bio,
      }));
    }
  }, [userProfile]);

  const progress = (currentStep / STEPS.length) * 100;

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
            academic_title: { type: 'string' },
            institution: { type: 'string' },
            department: { type: 'string' },
            research_areas: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            publications_count: { type: 'number' },
            orcid_id: { type: 'string' },
            google_scholar_url: { type: 'string' },
            researchgate_url: { type: 'string' }
          }
        }
      });

      if (extracted.status === 'success' && extracted.output) {
        const output = extracted.output;
        setFormData(prev => ({
          ...prev,
          academic_title: output.academic_title || prev.academic_title,
          institution: output.institution || prev.institution,
          department: output.department || prev.department,
          research_areas: output.research_areas?.length > 0 ? output.research_areas : prev.research_areas,
          bio: output.bio || prev.bio,
          publications_count: output.publications_count || prev.publications_count,
          orcid_id: output.orcid_id || prev.orcid_id,
          google_scholar_url: output.google_scholar_url || prev.google_scholar_url,
          researchgate_url: output.researchgate_url || prev.researchgate_url
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

  const toggleResearchArea = (area) => {
    const current = formData.research_areas;
    if (current.includes(area)) {
      setFormData({ ...formData, research_areas: current.filter(a => a !== area) });
    } else if (current.length < 5) {
      setFormData({ ...formData, research_areas: [...current, area] });
    }
  };

  const toggleCollabType = (type) => {
    const current = formData.collaboration_types;
    if (current.includes(type)) {
      setFormData({ ...formData, collaboration_types: current.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, collaboration_types: [...current, type] });
    }
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
          organization: formData.institution || null,
          department: formData.department || null,
          job_title: formData.academic_title || null,
          expertise_areas: formData.research_areas,
          bio: formData.bio || null,
          cv_url: formData.cv_url || null,
          onboarding_completed: true,
          persona_onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          metadata: {
            orcid_id: formData.orcid_id,
            google_scholar_url: formData.google_scholar_url,
            researchgate_url: formData.researchgate_url,
            publications_count: formData.publications_count,
            collaboration_types: formData.collaboration_types
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create researcher profile entry
      await supabase.from('researcher_profiles').upsert({
        user_id: user.id,
        user_email: user.email,
        institution: formData.institution,
        department: formData.department,
        academic_title: formData.academic_title,
        research_areas: formData.research_areas,
        collaboration_interests: formData.collaboration_types,
        orcid_id: formData.orcid_id,
        google_scholar_url: formData.google_scholar_url,
        cv_url: formData.cv_url,
        is_verified: false
      }, { onConflict: 'user_id' });

      await queryClient.invalidateQueries(['user-profile']);
      if (checkAuth) await checkAuth();

      toast.success(t({ en: 'Researcher profile complete!', ar: 'تم إكمال ملف الباحث!' }));
      onComplete?.(formData);
      navigate(createPageUrl('ResearcherDashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t({ en: 'Failed to complete setup', ar: 'فشل في إكمال الإعداد' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // CV is optional
      case 2: return formData.institution.trim() !== '';
      case 3: return formData.research_areas.length > 0;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900/95 via-slate-900/95 to-teal-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FlaskConical className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-bold">
                {t({ en: 'Researcher Profile Setup', ar: 'إعداد ملف الباحث' })}
              </h1>
            </div>
            <p className="text-white/60">
              {t({ en: 'Connect with municipalities for impactful research', ar: 'تواصل مع البلديات للبحوث المؤثرة' })}
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
                        isActive ? 'bg-green-600 text-white' : 
                        isComplete ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/60'
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
            <Card className="border-2 border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  {t({ en: 'Import Academic CV (Optional)', ar: 'استيراد السيرة الأكاديمية (اختياري)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50/50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-10 w-10 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">
                        {t({ en: 'Upload Academic CV', ar: 'رفع السيرة الأكاديمية' })}
                      </h3>
                      <p className="text-sm text-green-700 mb-3">
                        {t({ en: 'AI will extract your research areas, publications, and academic links', ar: 'سيستخرج الذكاء الاصطناعي مجالات بحثك ومنشوراتك وروابطك الأكاديمية' })}
                      </p>
                      <FileUploader
                        onUploadComplete={handleCVUpload}
                        type="document"
                        label={t({ en: 'Upload CV (PDF, DOCX)', ar: 'رفع السيرة الذاتية (PDF, DOCX)' })}
                        maxSize={10}
                      />
                      {isExtractingCV && (
                        <div className="flex items-center gap-2 mt-3 text-green-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t({ en: 'AI is extracting your academic information...', ar: 'الذكاء الاصطناعي يستخرج معلوماتك الأكاديمية...' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {formData.cv_url && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{t({ en: 'CV uploaded and processed!', ar: 'تم رفع ومعالجة السيرة الذاتية!' })}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Institution */}
          {currentStep === 2 && (
            <Card className="border-2 border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  {t({ en: 'Your Institution', ar: 'مؤسستك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'Institution / University', ar: 'المؤسسة / الجامعة' })} *</Label>
                  <Input
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder={t({ en: 'King Saud University', ar: 'جامعة الملك سعود' })}
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Department / Faculty', ar: 'القسم / الكلية' })}</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder={t({ en: 'Computer Science Department', ar: 'قسم علوم الحاسب' })}
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Academic Title', ar: 'اللقب الأكاديمي' })}</Label>
                  <Input
                    value={formData.academic_title}
                    onChange={(e) => setFormData({ ...formData, academic_title: e.target.value })}
                    placeholder={t({ en: 'Associate Professor', ar: 'أستاذ مشارك' })}
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Brief Bio', ar: 'نبذة مختصرة' })}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t({ en: 'Your research focus and expertise...', ar: 'تركيزك البحثي وخبرتك...' })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Research Areas */}
          {currentStep === 3 && (
            <Card className="border-2 border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  {t({ en: 'Research Areas & Interests', ar: 'مجالات البحث والاهتمامات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Select your research areas (max 5)', ar: 'اختر مجالات بحثك (حد أقصى 5)' })} *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESEARCH_AREAS.map((area) => (
                      <div
                        key={area.en}
                        onClick={() => toggleResearchArea(area.en)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.research_areas.includes(area.en)
                            ? 'border-green-500 bg-green-50'
                            : 'border-border hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={formData.research_areas.includes(area.en)} />
                          <span className="text-sm">{area[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Collaboration Interests', ar: 'اهتمامات التعاون' })}
                  </Label>
                  <div className="space-y-2">
                    {COLLABORATION_TYPES.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => toggleCollabType(type.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.collaboration_types.includes(type.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-border hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={formData.collaboration_types.includes(type.id)} />
                          <span className="text-sm">{type.label[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Academic Links */}
          {currentStep === 4 && (
            <Card className="border-2 border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-green-600" />
                  {t({ en: 'Academic Profiles', ar: 'الملفات الأكاديمية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'ORCID ID', ar: 'معرف ORCID' })}</Label>
                  <Input
                    value={formData.orcid_id}
                    onChange={(e) => setFormData({ ...formData, orcid_id: e.target.value })}
                    placeholder="0000-0000-0000-0000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t({ en: 'Your unique researcher identifier', ar: 'معرفك الفريد كباحث' })}
                  </p>
                </div>

                <div>
                  <Label>{t({ en: 'Google Scholar URL', ar: 'رابط Google Scholar' })}</Label>
                  <Input
                    value={formData.google_scholar_url}
                    onChange={(e) => setFormData({ ...formData, google_scholar_url: e.target.value })}
                    placeholder="https://scholar.google.com/citations?user=..."
                  />
                </div>

                <div>
                  <Label>{t({ en: 'ResearchGate URL', ar: 'رابط ResearchGate' })}</Label>
                  <Input
                    value={formData.researchgate_url}
                    onChange={(e) => setFormData({ ...formData, researchgate_url: e.target.value })}
                    placeholder="https://www.researchgate.net/profile/..."
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Approximate Publications Count', ar: 'عدد المنشورات التقريبي' })}</Label>
                  <Input
                    type="number"
                    value={formData.publications_count}
                    onChange={(e) => setFormData({ ...formData, publications_count: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <Card className="border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
                <h2 className="text-2xl font-bold text-emerald-900">
                  {t({ en: 'Research Profile Ready!', ar: 'ملف البحث جاهز!' })}
                </h2>
                <p className="text-emerald-700">
                  {t({ 
                    en: 'Start exploring R&D opportunities and connect with municipalities!',
                    ar: 'ابدأ باستكشاف فرص البحث والتطوير والتواصل مع البلديات!'
                  })}
                </p>

                <div className="p-4 bg-white rounded-lg border text-left">
                  <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Your Profile', ar: 'ملفك' })}</p>
                  <div className="space-y-2">
                    <p><strong>{t({ en: 'Institution:', ar: 'المؤسسة:' })}</strong> {formData.institution}</p>
                    {formData.academic_title && <p><strong>{t({ en: 'Title:', ar: 'اللقب:' })}</strong> {formData.academic_title}</p>}
                    <div>
                      <strong>{t({ en: 'Research Areas:', ar: 'مجالات البحث:' })}</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.research_areas.map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </div>
                    {formData.cv_url && (
                      <p className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {t({ en: 'CV uploaded', ar: 'تم رفع السيرة الذاتية' })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onSkip?.()}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? t({ en: 'Skip', ar: 'تخطي' }) : t({ en: 'Back', ar: 'رجوع' })}
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {t({ en: 'Complete Setup', ar: 'إكمال الإعداد' })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
