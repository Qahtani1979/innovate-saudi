import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { 
  Building2, ArrowRight, ArrowLeft, CheckCircle2, 
  MapPin, Users, Shield, BookOpen, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'Municipality', ar: 'البلدية' }, icon: Building2 },
  { id: 2, title: { en: 'Department', ar: 'القسم' }, icon: Users },
  { id: 3, title: { en: 'Role Setup', ar: 'إعداد الدور' }, icon: Shield },
  { id: 4, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
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

export default function MunicipalityStaffOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    municipality_id: '',
    department: '',
    role_level: 'staff',
    job_title: '',
    employee_id: '',
    work_phone: '',
    focus_areas: [],
    justification: ''
  });

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
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

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
      case 1: return formData.municipality_id !== '';
      case 2: return formData.department !== '';
      case 3: return formData.role_level !== '';
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

          {/* Step 1: Municipality Selection */}
          {currentStep === 1 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Select Your Municipality', ar: 'اختر بلديتك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'Municipality', ar: 'البلدية' })}</Label>
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

          {/* Step 2: Department */}
          {currentStep === 2 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Your Department', ar: 'قسمك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'Department', ar: 'القسم' })}</Label>
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

                <div>
                  <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</Label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder={t({ en: 'Your position title', ar: 'مسمى منصبك' })}
                  />
                </div>

                <div>
                  <Label>{t({ en: 'Work Phone (optional)', ar: 'هاتف العمل (اختياري)' })}</Label>
                  <Input
                    value={formData.work_phone}
                    onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
                    placeholder="+966..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Role Setup */}
          {currentStep === 3 && (
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

          {/* Step 4: Complete */}
          {currentStep === 4 && (
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
                    <p><strong>{t({ en: 'Role:', ar: 'الدور:' })}</strong> {ROLE_LEVELS.find(r => r.id === formData.role_level)?.label[language]}</p>
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

            {currentStep < 4 ? (
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
