import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { 
  Users, ArrowRight, ArrowLeft, CheckCircle2, 
  MapPin, Heart, Bell, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: { en: 'Location', ar: 'الموقع' }, icon: MapPin },
  { id: 2, title: { en: 'Interests', ar: 'الاهتمامات' }, icon: Heart },
  { id: 3, title: { en: 'Notifications', ar: 'الإشعارات' }, icon: Bell },
  { id: 4, title: { en: 'Complete', ar: 'اكتمال' }, icon: CheckCircle2 }
];

const INTEREST_AREAS = [
  { id: 'urban_planning', label: { en: 'Urban Planning', ar: 'التخطيط العمراني' }, icon: '🏙️' },
  { id: 'environment', label: { en: 'Environment & Sustainability', ar: 'البيئة والاستدامة' }, icon: '🌱' },
  { id: 'transportation', label: { en: 'Transportation & Mobility', ar: 'النقل والتنقل' }, icon: '🚌' },
  { id: 'public_services', label: { en: 'Public Services', ar: 'الخدمات العامة' }, icon: '🏛️' },
  { id: 'technology', label: { en: 'Technology & Smart City', ar: 'التقنية والمدينة الذكية' }, icon: '💡' },
  { id: 'health', label: { en: 'Health & Wellness', ar: 'الصحة والعافية' }, icon: '🏥' },
  { id: 'education', label: { en: 'Education', ar: 'التعليم' }, icon: '📚' },
  { id: 'safety', label: { en: 'Public Safety', ar: 'السلامة العامة' }, icon: '🛡️' },
  { id: 'culture', label: { en: 'Culture & Recreation', ar: 'الثقافة والترفيه' }, icon: '🎭' },
  { id: 'economy', label: { en: 'Local Economy', ar: 'الاقتصاد المحلي' }, icon: '💼' }
];

const PARTICIPATION_TYPES = [
  { id: 'ideas', label: { en: 'Submit Ideas', ar: 'تقديم الأفكار' } },
  { id: 'voting', label: { en: 'Vote on Initiatives', ar: 'التصويت على المبادرات' } },
  { id: 'pilots', label: { en: 'Participate in Pilots', ar: 'المشاركة في التجارب' } },
  { id: 'feedback', label: { en: 'Give Feedback', ar: 'تقديم الملاحظات' } },
  { id: 'events', label: { en: 'Attend Events', ar: 'حضور الفعاليات' } }
];

export default function CitizenOnboardingWizard({ onComplete, onSkip }) {
  const { language, isRTL, t } = useLanguage();
  const { user, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    city_id: '',
    neighborhood: '',
    interests: [],
    participation_types: [],
    notify_new_challenges: true,
    notify_pilot_opportunities: true,
    notify_events: true,
    notify_weekly_digest: false
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name_en, name_ar, municipality_id')
        .eq('is_active', true)
        .order('name_en');
      if (error) throw error;
      return data || [];
    }
  });

  const progress = (currentStep / STEPS.length) * 100;

  const toggleInterest = (id) => {
    const current = formData.interests;
    if (current.includes(id)) {
      setFormData({ ...formData, interests: current.filter(i => i !== id) });
    } else if (current.length < 5) {
      setFormData({ ...formData, interests: [...current, id] });
    }
  };

  const toggleParticipation = (id) => {
    const current = formData.participation_types;
    if (current.includes(id)) {
      setFormData({ ...formData, participation_types: current.filter(p => p !== id) });
    } else {
      setFormData({ ...formData, participation_types: [...current, id] });
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
          city_id: formData.city_id || null,
          interests: formData.interests,
          onboarding_completed: true,
          notification_preferences: {
            new_challenges: formData.notify_new_challenges,
            pilot_opportunities: formData.notify_pilot_opportunities,
            events: formData.notify_events,
            weekly_digest: formData.notify_weekly_digest
          },
          metadata: {
            neighborhood: formData.neighborhood,
            participation_types: formData.participation_types
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Initialize citizen points record
      await supabase.from('citizen_points').upsert({
        user_id: user.id,
        user_email: user.email,
        points: 10, // Welcome bonus
        level: 1,
        total_earned: 10
      }, { onConflict: 'user_id' });

      await queryClient.invalidateQueries(['user-profile']);
      if (checkAuth) await checkAuth();

      toast.success(t({ en: 'Welcome to the community!', ar: 'مرحباً بك في المجتمع!' }));
      onComplete?.(formData);
      navigate(createPageUrl('CitizenDashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t({ en: 'Failed to complete setup', ar: 'فشل في إكمال الإعداد' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.city_id !== '';
      case 2: return formData.interests.length > 0;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-900/95 via-slate-900/95 to-amber-900/95 backdrop-blur-sm z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-8 w-8 text-orange-400" />
              <h1 className="text-2xl font-bold">
                {t({ en: 'Join the Community', ar: 'انضم إلى المجتمع' })}
              </h1>
            </div>
            <p className="text-white/60">
              {t({ en: 'Shape the future of your city', ar: 'شارك في تشكيل مستقبل مدينتك' })}
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
                        isActive ? 'bg-orange-600 text-white' : 
                        isComplete ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/60'
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

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <Card className="border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  {t({ en: 'Your Location', ar: 'موقعك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t({ en: 'City', ar: 'المدينة' })} *</Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select your city...', ar: 'اختر مدينتك...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {language === 'ar' ? city.name_ar : city.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t({ en: 'Neighborhood (optional)', ar: 'الحي (اختياري)' })}</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder={t({ en: 'Enter your neighborhood', ar: 'أدخل حيك' })}
                  />
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    {t({ 
                      en: '📍 Your location helps us show relevant local challenges and opportunities.',
                      ar: '📍 يساعدنا موقعك في عرض التحديات والفرص المحلية ذات الصلة.'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Interests */}
          {currentStep === 2 && (
            <Card className="border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-orange-600" />
                  {t({ en: 'What Do You Care About?', ar: 'ما الذي يهمك؟' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'Select your interests (max 5)', ar: 'اختر اهتماماتك (حد أقصى 5)' })} *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTEREST_AREAS.map((interest) => (
                      <div
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.interests.includes(interest.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-border hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{interest.icon}</span>
                          <span className="text-sm font-medium">{interest.label[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">
                    {t({ en: 'How would you like to participate?', ar: 'كيف تريد المشاركة؟' })}
                  </Label>
                  <div className="space-y-2">
                    {PARTICIPATION_TYPES.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => toggleParticipation(type.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.participation_types.includes(type.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-border hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={formData.participation_types.includes(type.id)} />
                          <span className="text-sm">{type.label[language]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Notifications */}
          {currentStep === 3 && (
            <Card className="border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  {t({ en: 'Stay Updated', ar: 'ابق على اطلاع' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{t({ en: 'New Challenges', ar: 'التحديات الجديدة' })}</p>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Get notified about new local challenges', ar: 'احصل على إشعارات حول التحديات المحلية الجديدة' })}</p>
                  </div>
                  <Switch
                    checked={formData.notify_new_challenges}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_new_challenges: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{t({ en: 'Pilot Opportunities', ar: 'فرص التجارب' })}</p>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Be invited to test new solutions', ar: 'استقبل دعوات لاختبار حلول جديدة' })}</p>
                  </div>
                  <Switch
                    checked={formData.notify_pilot_opportunities}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_pilot_opportunities: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{t({ en: 'Community Events', ar: 'فعاليات المجتمع' })}</p>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Workshops, meetups, and more', ar: 'ورش عمل، لقاءات، والمزيد' })}</p>
                  </div>
                  <Switch
                    checked={formData.notify_events}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_events: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{t({ en: 'Weekly Digest', ar: 'الملخص الأسبوعي' })}</p>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Summary of activities and updates', ar: 'ملخص الأنشطة والتحديثات' })}</p>
                  </div>
                  <Switch
                    checked={formData.notify_weekly_digest}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_weekly_digest: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="relative inline-block">
                  <CheckCircle2 className="h-16 w-16 text-amber-600 mx-auto" />
                  <Sparkles className="h-6 w-6 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900">
                  {t({ en: 'Welcome to the Community!', ar: 'مرحباً بك في المجتمع!' })}
                </h2>
                <p className="text-amber-700">
                  {t({ 
                    en: 'You earned 10 points as a welcome bonus! Start exploring and contributing.',
                    ar: 'حصلت على 10 نقاط كمكافأة ترحيبية! ابدأ الاستكشاف والمساهمة.'
                  })}
                </p>

                <div className="p-4 bg-white rounded-lg border text-left">
                  <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Your Interests', ar: 'اهتماماتك' })}</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((id) => {
                      const interest = INTEREST_AREAS.find(i => i.id === id);
                      return interest ? (
                        <Badge key={id} variant="outline" className="text-sm">
                          {interest.icon} {interest.label[language]}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">10</p>
                    <p className="text-xs text-orange-700">{t({ en: 'Points', ar: 'نقاط' })}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">1</p>
                    <p className="text-xs text-amber-700">{t({ en: 'Level', ar: 'المستوى' })}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">🎉</p>
                    <p className="text-xs text-orange-700">{t({ en: 'Welcome!', ar: 'أهلاً!' })}</p>
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
                className="bg-orange-600 hover:bg-orange-700"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-600 to-amber-600"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {t({ en: 'Start Exploring', ar: 'ابدأ الاستكشاف' })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
