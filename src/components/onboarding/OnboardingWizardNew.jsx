import { useState } from 'react';
import { useOnboardingMutations } from '@/hooks/useOnboardingMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import {
  Sparkles, Building2, CheckCircle,
  ArrowRight, ArrowLeft, Shield, Microscope, Lightbulb, Users, Target
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function OnboardingWizardNew({ user, onComplete }) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organization_type: '',
    organization_name: '',
    sector: '',
    city: '',
    job_title: '',
    suggested_roles: [],
    selected_persona: ''
  });

  // AI-powered role suggestion based on profile
  const suggestRoles = (data) => {
    const suggestions = [];

    if (data.organization_type === 'municipality') {
      suggestions.push('Municipality Innovation Officer', 'Municipality Director');
    } else if (data.organization_type === 'startup') {
      suggestions.push('Startup/Provider', 'Solution Provider');
    } else if (data.organization_type === 'university') {
      suggestions.push('Researcher/Academic', 'Research Lead');
    } else if (data.organization_type === 'ministry') {
      suggestions.push('Ministry Innovation Lead');
    } else if (data.organization_type === 'agency') {
      suggestions.push('Government Agency Lead');
    }

    return suggestions;
  };

  const personas = [
    {
      id: 'municipality',
      icon: Building2,
      name: { en: 'Municipality Officer', ar: 'مسؤول البلدية' },
      description: { en: 'I work for a municipality and want to solve local challenges', ar: 'أعمل في بلدية وأريد حل التحديات المحلية' },
      roles: ['Municipality Innovation Officer', 'Municipality Director'],
      color: 'green'
    },
    {
      id: 'startup',
      icon: Lightbulb,
      name: { en: 'Startup/Provider', ar: 'شركة ناشئة/مزود' },
      description: { en: 'I offer solutions to municipal challenges', ar: 'أقدم حلولاً للتحديات البلدية' },
      roles: ['Startup/Provider', 'Solution Provider'],
      color: 'orange'
    },
    {
      id: 'researcher',
      icon: Microscope,
      name: { en: 'Researcher/Academic', ar: 'باحث/أكاديمي' },
      description: { en: 'I conduct R&D for innovation', ar: 'أجري البحث والتطوير للابتكار' },
      roles: ['Researcher/Academic', 'Research Lead'],
      color: 'indigo'
    },
    {
      id: 'admin',
      icon: Shield,
      name: { en: 'Platform Administrator', ar: 'مدير المنصة' },
      description: { en: 'I manage the platform and strategy', ar: 'أدير المنصة والاستراتيجية' },
      roles: ['Platform Administrator', 'GDISB Strategy Lead'],
      color: 'purple'
    },
    {
      id: 'program',
      icon: Users,
      name: { en: 'Program Operator', ar: 'مشغل البرامج' },
      description: { en: 'I run innovation programs and events', ar: 'أدير برامج وفعاليات الابتكار' },
      roles: ['Program Operator'],
      color: 'pink'
    },
    {
      id: 'executive',
      icon: Target,
      name: { en: 'Executive Leadership', ar: 'القيادة التنفيذية' },
      description: { en: 'I oversee national innovation strategy', ar: 'أشرف على استراتيجية الابتكار الوطنية' },
      roles: ['Executive Leadership'],
      color: 'blue'
    }
  ];

  const { upsertProfile } = useOnboardingMutations();

  const handleNext = () => {
    if (step === 2) {
      const suggestions = suggestRoles(formData);
      setFormData({ ...formData, suggested_roles: suggestions });
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    const selectedPersona = personas.find(p => p.id === formData.selected_persona);
    try {
      await upsertProfile.mutateAsync({
        table: 'user_profiles',
        data: {
          user_id: user?.id,
          organization_type: formData.organization_type,
          organization_name: formData.organization_name,
          sector: formData.sector,
          city: formData.city,
          job_title: formData.job_title,
          onboarding_completed: true,
          // Storing suggested roles in metadata if needed, or just relying on subsequent role assignment logic
          metadata: {
            suggested_roles: selectedPersona?.roles || []
          }
        }
      });
      toast.success(t({ en: 'Profile updated successfully!', ar: 'تم تحديث الملف بنجاح!' }));
      onComplete?.();
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(t({ en: 'Failed to update profile', ar: 'فشل تحديث الملف' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-2xl">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 rounded-t-lg">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 rounded-t-lg"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">
            {step === 1 && t({ en: 'Welcome to Saudi Innovates!', ar: 'مرحباً بك في الابتكار السعودي!' })}
            {step === 2 && t({ en: 'Tell us about yourself', ar: 'أخبرنا عن نفسك' })}
            {step === 3 && t({ en: 'Choose your role', ar: 'اختر دورك' })}
            {step === 4 && t({ en: "You're all set!", ar: 'كل شيء جاهز!' })}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 text-center py-8">
              <p className="text-lg text-slate-600">
                {t({
                  en: 'The National Municipal Innovation Platform connecting challenges, solutions, and partnerships across Saudi Arabia.',
                  ar: 'المنصة الوطنية للابتكار البلدي التي تربط التحديات والحلول والشراكات في جميع أنحاء المملكة العربية السعودية.'
                })}
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">{t({ en: 'Solve Challenges', ar: 'حل التحديات' })}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">{t({ en: 'Test Pilots', ar: 'اختبار التجارب' })}</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl">
                  <Target className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">{t({ en: 'Scale Solutions', ar: 'توسيع الحلول' })}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Organization Type', ar: 'نوع المنظمة' })}
                </label>
                <Select value={formData.organization_type} onValueChange={(v) => setFormData({ ...formData, organization_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="municipality">{t({ en: 'Municipality', ar: 'بلدية' })}</SelectItem>
                    <SelectItem value="ministry">{t({ en: 'Ministry', ar: 'وزارة' })}</SelectItem>
                    <SelectItem value="agency">{t({ en: 'Government Agency', ar: 'جهة حكومية' })}</SelectItem>
                    <SelectItem value="startup">{t({ en: 'Startup', ar: 'شركة ناشئة' })}</SelectItem>
                    <SelectItem value="university">{t({ en: 'University', ar: 'جامعة' })}</SelectItem>
                    <SelectItem value="research_center">{t({ en: 'Research Center', ar: 'مركز بحثي' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Organization Name', ar: 'اسم المنظمة' })}
                </label>
                <Input
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  placeholder={t({ en: 'Enter organization name...', ar: 'أدخل اسم المنظمة...' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'City', ar: 'المدينة' })}
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t({ en: 'e.g., Riyadh', ar: 'مثال: الرياض' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'Sector', ar: 'القطاع' })}
                  </label>
                  <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban_design">{t({ en: 'Urban Design', ar: 'التصميم الحضري' })}</SelectItem>
                      <SelectItem value="transport">{t({ en: 'Transport', ar: 'النقل' })}</SelectItem>
                      <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
                      <SelectItem value="digital_services">{t({ en: 'Digital Services', ar: 'الخدمات الرقمية' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}
                </label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder={t({ en: 'Your position...', ar: 'منصبك...' })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Persona Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {t({ en: 'AI Recommendation', ar: 'توصية الذكاء الاصطناعي' })}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {t({
                        en: `Based on your profile, we suggest: ${formData.suggested_roles.join(', ')}`,
                        ar: `بناءً على ملفك الشخصي، نقترح: ${formData.suggested_roles.join('، ')}`
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {personas.map((persona) => {
                  const Icon = persona.icon;
                  const isSelected = formData.selected_persona === persona.id;
                  const isRecommended = formData.suggested_roles.some(r => persona.roles.includes(r));

                  return (
                    <button
                      key={persona.id}
                      onClick={() => setFormData({ ...formData, selected_persona: persona.id })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                          ? `border-${persona.color}-500 bg-${persona.color}-50`
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Icon className={`h-8 w-8 text-${persona.color}-600`} />
                        {isRecommended && (
                          <Badge className="bg-blue-600 text-xs">
                            {t({ en: 'Recommended', ar: 'موصى به' })}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium mb-1">{persona.name[language]}</h3>
                      <p className="text-xs text-slate-600">{persona.description[language]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {t({ en: 'Welcome aboard!', ar: 'مرحباً بك!' })}
                </h3>
                <p className="text-slate-600">
                  {t({
                    en: "Your profile has been set up. You can now access your personalized dashboard.",
                    ar: 'تم إعداد ملفك الشخصي. يمكنك الآن الوصول إلى لوحة التحكم المخصصة لك.'
                  })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-slate-600 mb-2">{t({ en: 'Your assigned roles:', ar: 'أدوارك المعينة:' })}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {personas.find(p => p.id === formData.selected_persona)?.roles.map((role, i) => (
                    <Badge key={i} className="bg-blue-600">{role}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={handleNext}
                disabled={step === 2 && !formData.organization_type}
                className="ml-auto"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={handleNext}
                disabled={!formData.selected_persona}
                className="ml-auto"
              >
                {t({ en: 'Complete', ar: 'إكمال' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 4 && (
              <Button
                onClick={handleComplete}
                disabled={upsertProfile.isPending}
                className="mx-auto"
              >
                {t({ en: 'Go to Dashboard', ar: 'الذهاب للوحة التحكم' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
