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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import FileUploader from '../FileUploader';
import { 
  Building2, ArrowRight, ArrowLeft, CheckCircle2, 
  MapPin, Users, Shield, BookOpen, Loader2, Upload, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'CV Import', ar: 'استيراد السيرة' }, icon: Upload },
  { id: 2, title: { en: 'Municipality', ar: 'البلدية' }, icon: Building2 },
  { id: 3, title: { en: 'Department', ar: 'القسم' }, icon: Users },
  { id: 4, title: { en: 'Role Setup', ar: 'إعداد الدور' }, icon: Shield },
  { id: 5, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

const DEPARTMENTS = [
  { en: 'Urban Planning', ar: 'التخطيط العمراني' },
  { en: 'Public Works', ar: 'الأشغال العامة' },
  { en: 'Environmental Services', ar: 'الخدمات البيئية' },
  { en: 'Transportation', ar: 'النقل' },
  { en: 'Digital Services', ar: 'الخدمات الرقمية' },
  { en: 'Community Services', ar: 'خدمات المجتمع' },
  { en: 'Economic Development', ar: 'التنمية الاقتصادية' },
  { en: 'Public Safety', ar: 'السلامة العامة' },
  { en: 'Innovation & Technology', ar: 'الابتكار والتقنية' },
  { en: 'Other', ar: 'أخرى' }
];

const ROLE_LEVELS = [
  { id: 'staff', label: { en: 'Staff Member', ar: 'موظف' }, description: { en: 'View challenges and submit ideas', ar: 'عرض التحديات وتقديم الأفكار' } },
  { id: 'coordinator', label: { en: 'Innovation Coordinator', ar: 'منسق الابتكار' }, description: { en: 'Manage challenges and pilots', ar: 'إدارة التحديات والتجارب' } },
  { id: 'manager', label: { en: 'Department Manager', ar: 'مدير القسم' }, description: { en: 'Approve and oversee projects', ar: 'الموافقة والإشراف على المشاريع' } }
];

const SPECIALIZATIONS = [
  { en: 'Project Management', ar: 'إدارة المشاريع' },
  { en: 'Policy Development', ar: 'تطوير السياسات' },
  { en: 'Community Engagement', ar: 'التفاعل المجتمعي' },
  { en: 'Technical Solutions', ar: 'الحلول التقنية' },
  { en: 'Data Analysis', ar: 'تحليل البيانات' },
  { en: 'Budget Management', ar: 'إدارة الميزانية' },
  { en: 'Procurement', ar: 'المشتريات' },
  { en: 'Quality Assurance', ar: 'ضمان الجودة' }
];

export default function MunicipalityStaffOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  
  const [formData, setFormData] = useState({
    cv_url: '',
    municipality_id: '',
    department: '',
    role_level: 'staff',
    job_title: '',
    employee_id: '',
    work_phone: '',
    years_of_experience: 0,
    specializations: [],
    justification: ''
  });

  // Pre-populate from Stage 1 onboarding data
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        cv_url: userProfile.cv_url || prev.cv_url,
        municipality_id: userProfile.municipality_id || prev.municipality_id,
        department: userProfile.department_en || userProfile.department || prev.department,
        job_title: userProfile.job_title_en || userProfile.job_title || prev.job_title,
        work_phone: userProfile.work_phone || prev.work_phone,
        years_of_experience: userProfile.years_experience || prev.years_of_experience,
        specializations: userProfile.expertise_areas?.length > 0 ? userProfile.expertise_areas : prev.specializations,
      }));
    }
  }, [userProfile]);

  // Fetch municipalities
  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar, region_id')
        .eq('is_active', true)
        .order('name_en');
      if (error) throw error;
      return data || [];
    }
  });

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
            job_title: { type: 'string' },
            department: { type: 'string' },
            organization: { type: 'string' },
            years_of_experience: { type: 'number' },
            specializations: { type: 'array', items: { type: 'string' } },
            phone: { type: 'string' },
            employee_id: { type: 'string' }
          }
        }
      });

      if (extracted.status === 'success' && extracted.output) {
        const output = extracted.output;
        setFormData(prev => ({
          ...prev,
          job_title: output.job_title || prev.job_title,
          department: output.department || prev.department,
          years_of_experience: output.years_of_experience || prev.years_of_experience,
          specializations: output.specializations?.length > 0 ? output.specializations : prev.specializations,
          work_phone: output.phone || prev.work_phone,
          employee_id: output.employee_id || prev.employee_id
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

  const toggleSpecialization = (spec) => {
    const current = formData.specializations;
    if (current.includes(spec)) {
      setFormData({ ...formData, specializations: current.filter(s => s !== spec) });
    } else if (current.length < 5) {
      setFormData({ ...formData, specializations: [...current, spec] });
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
          municipality_id: formData.municipality_id || null,
          department: formData.department || null,
          job_title: formData.job_title || null,
          work_phone: formData.work_phone || null,
          cv_url: formData.cv_url || null,
          onboarding_completed: true,
          persona_onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create municipality staff profile
      await supabase.from('municipality_staff_profiles').upsert({
        user_id: user.id,
        user_email: user.email,
        municipality_id: formData.municipality_id,
        department: formData.department,
        job_title: formData.job_title,
        employee_id: formData.employee_id,
        years_of_experience: formData.years_of_experience,
        specializations: formData.specializations,
        cv_url: formData.cv_url,
        is_verified: false
      }, { onConflict: 'user_id' });

      // Submit role request if not staff level
      if (formData.role_level !== 'staff' && formData.justification) {
        await supabase.from('role_requests').insert({
          user_id: user.id,
          user_email: user.email,
          requested_role: formData.role_level === 'manager' ? 'municipality_admin' : 'municipality_staff',
          justification: formData.justification,
          status: 'pending',
          metadata: {
            municipality_id: formData.municipality_id,
            department: formData.department,
            employee_id: formData.employee_id
          }
        });
        toast.info(t({ en: 'Role request submitted for approval', ar: 'تم تقديم طلب الدور للموافقة' }));
      }

      await queryClient.invalidateQueries(['user-profile']);
      if (checkAuth) await checkAuth();

      toast.success(t({ en: 'Municipality profile setup complete!', ar: 'تم إعداد ملف البلدية!' }));
      onComplete?.(formData);
      navigate(createPageUrl('MunicipalityDashboard'));
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
      case 2: return formData.municipality_id !== '';
      case 3: return formData.department !== '';
      case 4: return formData.role_level !== '';
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-slate-900/95 to-blue-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold">
                {t({ en: 'Municipality Staff Setup', ar: 'إعداد موظف البلدية' })}
              </h1>
            </div>
            <p className="text-white/60">
              {t({ en: 'Configure your municipal role and permissions', ar: 'قم بتهيئة دورك وصلاحياتك البلدية' })}
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
                        isActive ? 'bg-purple-600 text-white' : 
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

          {/* Step 1: CV Import */}
          {currentStep === 1 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Import Your CV (Optional)', ar: 'استيراد سيرتك الذاتية (اختياري)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-10 w-10 text-purple-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 mb-1">
                        {t({ en: 'Upload CV/Resume', ar: 'رفع السيرة الذاتية' })}
                      </h3>
                      <p className="text-sm text-purple-700 mb-3">
                        {t({ en: 'AI will extract your job title, experience, and specializations', ar: 'سيستخرج الذكاء الاصطناعي مسماك الوظيفي وخبرتك وتخصصاتك' })}
                      </p>
                      <FileUploader
                        onUploadComplete={handleCVUpload}
                        type="document"
                        label={t({ en: 'Upload CV (PDF, DOCX)', ar: 'رفع السيرة الذاتية (PDF, DOCX)' })}
                        maxSize={10}
                      />
                      {isExtractingCV && (
                        <div className="flex items-center gap-2 mt-3 text-purple-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t({ en: 'AI is extracting your information...', ar: 'الذكاء الاصطناعي يستخرج معلوماتك...' })}</span>
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

                <p className="text-xs text-center text-muted-foreground">
                  {t({ en: 'You can skip this and fill in details manually', ar: 'يمكنك تخطي هذا وملء التفاصيل يدوياً' })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Municipality Selection */}
          {currentStep === 2 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Select Your Municipality', ar: 'اختر بلديتك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'Municipality', ar: 'البلدية' })} *</Label>
                  <Select
                    value={formData.municipality_id}
                    onValueChange={(value) => setFormData({ ...formData, municipality_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select municipality...', ar: 'اختر البلدية...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {language === 'ar' ? m.name_ar : m.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t({ en: 'Employee ID (optional)', ar: 'رقم الموظف (اختياري)' })}</Label>
                  <Input
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder={t({ en: 'Enter your employee ID', ar: 'أدخل رقم الموظف' })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Department */}
          {currentStep === 3 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Your Department & Details', ar: 'قسمك وتفاصيلك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'Department', ar: 'القسم' })} *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select department...', ar: 'اختر القسم...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d.en} value={d.en}>
                          {language === 'ar' ? d.ar : d.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</Label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      placeholder={t({ en: 'Your position title', ar: 'مسمى منصبك' })}
                    />
                  </div>
                  <div>
                    <Label>{t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })}</Label>
                    <Input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <Label>{t({ en: 'Work Phone (optional)', ar: 'هاتف العمل (اختياري)' })}</Label>
                  <Input
                    value={formData.work_phone}
                    onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
                    placeholder="+966..."
                  />
                </div>

                <div>
                  <Label className="mb-2 block">{t({ en: 'Specializations (max 5)', ar: 'التخصصات (حد أقصى 5)' })}</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => {
                      const isSelected = formData.specializations.includes(spec.en);
                      return (
                        <Badge
                          key={spec.en}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${isSelected ? 'bg-purple-600' : 'hover:bg-purple-50'}`}
                          onClick={() => toggleSpecialization(spec.en)}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {spec[language]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Role Setup */}
          {currentStep === 4 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Role & Permissions', ar: 'الدور والصلاحيات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {ROLE_LEVELS.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setFormData({ ...formData, role_level: role.id })}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.role_level === role.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-border hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          formData.role_level === role.id
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-muted-foreground'
                        }`}>
                          {formData.role_level === role.id && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{role.label[language]}</p>
                          <p className="text-sm text-muted-foreground">{role.description[language]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.role_level !== 'staff' && (
                  <div>
                    <Label>{t({ en: 'Justification for elevated role', ar: 'مبرر الدور المرتفع' })}</Label>
                    <Textarea
                      value={formData.justification}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      placeholder={t({ en: 'Explain why you need this role level...', ar: 'اشرح لماذا تحتاج هذا المستوى من الدور...' })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t({ en: 'Your request will be reviewed by an administrator', ar: 'سيتم مراجعة طلبك من قبل مسؤول' })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <h2 className="text-2xl font-bold text-green-900">
                  {t({ en: 'Ready to Go!', ar: 'جاهز للانطلاق!' })}
                </h2>
                <p className="text-green-700">
                  {t({ 
                    en: 'Your municipality profile is configured. Start exploring challenges and innovations!',
                    ar: 'تم تهيئة ملف بلديتك. ابدأ باستكشاف التحديات والابتكارات!'
                  })}
                </p>

                <div className="p-4 bg-white rounded-lg border text-left">
                  <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Summary', ar: 'ملخص' })}</p>
                  <div className="space-y-1 text-sm">
                    <p><strong>{t({ en: 'Municipality:', ar: 'البلدية:' })}</strong> {municipalities.find(m => m.id === formData.municipality_id)?.[language === 'ar' ? 'name_ar' : 'name_en']}</p>
                    <p><strong>{t({ en: 'Department:', ar: 'القسم:' })}</strong> {formData.department}</p>
                    {formData.job_title && <p><strong>{t({ en: 'Title:', ar: 'المسمى:' })}</strong> {formData.job_title}</p>}
                    <p><strong>{t({ en: 'Role:', ar: 'الدور:' })}</strong> {ROLE_LEVELS.find(r => r.id === formData.role_level)?.label[language]}</p>
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
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
