import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Target,
  Users,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Layers,
  Map,
  Activity
} from 'lucide-react';

const STEPS = [
  { id: 'welcome', title: { en: 'Welcome', ar: 'مرحباً' } },
  { id: 'profile', title: { en: 'Your Profile', ar: 'ملفك الشخصي' } },
  { id: 'sectors', title: { en: 'Sector Focus', ar: 'تركيز القطاع' } },
  { id: 'responsibilities', title: { en: 'Responsibilities', ar: 'المسؤوليات' } },
  { id: 'complete', title: { en: 'Complete', ar: 'اكتمل' } },
];

export default function DeputyshipOnboardingWizard({ onComplete }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    phone: '',
    bio: '',
    selectedSectors: [],
    focusAreas: [],
    municipalitiesCount: 0,
  });

  // Fetch sectors
  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
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

  const updateProfile = useMutation({
    mutationFn: async (profileData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          title: profileData.title,
          department: profileData.department,
          phone: profileData.phone,
          bio: profileData.bio,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success(t({ en: 'Profile updated successfully!', ar: 'تم تحديث الملف بنجاح!' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to update profile', ar: 'فشل تحديث الملف' }));
      console.error('Profile update error:', error);
    }
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await updateProfile.mutateAsync(formData);
    onComplete?.();
    navigate('/executive-dashboard');
  };

  const toggleSector = (sectorId) => {
    setFormData(prev => ({
      ...prev,
      selectedSectors: prev.selectedSectors.includes(sectorId)
        ? prev.selectedSectors.filter(id => id !== sectorId)
        : [...prev.selectedSectors, sectorId]
    }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary-foreground" />
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
              <div className="text-center p-4 bg-muted rounded-lg">
                <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{municipalitiesCount}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Municipalities', ar: 'البلديات' })}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Layers className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{sectors.length}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Sectors', ar: 'القطاعات' })}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Globe className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">13</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Regions', ar: 'المناطق' })}</div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">{t({ en: 'Complete Your Profile', ar: 'أكمل ملفك الشخصي' })}</h2>
              <p className="text-muted-foreground text-sm">{t({ en: 'Tell us about your role', ar: 'أخبرنا عن دورك' })}</p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t({ en: 'e.g., Deputy Director of Innovation', ar: 'مثال: نائب مدير الابتكار' })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t({ en: 'Department', ar: 'الإدارة' })}</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder={t({ en: 'e.g., Strategy & Innovation', ar: 'مثال: الاستراتيجية والابتكار' })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t({ en: 'Phone', ar: 'الهاتف' })}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t({ en: 'Bio', ar: 'نبذة' })}</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t({ en: 'Brief description of your expertise...', ar: 'وصف موجز لخبرتك...' })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 'sectors':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">{t({ en: 'Select Your Sector Focus', ar: 'اختر تركيز قطاعك' })}</h2>
              <p className="text-muted-foreground text-sm">
                {t({ en: 'Choose the sectors you oversee', ar: 'اختر القطاعات التي تشرف عليها' })}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => toggleSector(sector.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.selectedSectors.includes(sector.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{sector.icon || '🏢'}</div>
                  <div className="font-medium text-sm">
                    {language === 'ar' ? sector.name_ar : sector.name_en}
                  </div>
                  {formData.selectedSectors.includes(sector.id) && (
                    <CheckCircle className="w-4 h-4 text-primary mt-2" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t({ en: `${formData.selectedSectors.length} sector(s) selected`, ar: `تم اختيار ${formData.selectedSectors.length} قطاع` })}
            </p>
          </div>
        );

      case 'responsibilities':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">{t({ en: 'Your Responsibilities', ar: 'مسؤولياتك' })}</h2>
              <p className="text-muted-foreground text-sm">
                {t({ en: 'Key areas of your oversight', ar: 'المجالات الرئيسية لإشرافك' })}
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Map, title: { en: 'Cross-Municipal Oversight', ar: 'الإشراف عبر البلديات' }, desc: { en: 'View challenges and pilots across all municipalities', ar: 'عرض التحديات والتجارب عبر جميع البلديات' } },
                { icon: Target, title: { en: 'Strategic Guidance', ar: 'التوجيه الاستراتيجي' }, desc: { en: 'Publish national guidance and best practices', ar: 'نشر التوجيهات الوطنية وأفضل الممارسات' } },
                { icon: BarChart3, title: { en: 'Benchmarking', ar: 'المقارنة المعيارية' }, desc: { en: 'Compare performance across municipalities', ar: 'مقارنة الأداء عبر البلديات' } },
                { icon: Activity, title: { en: 'Sector Analytics', ar: 'تحليلات القطاع' }, desc: { en: 'Access comprehensive sector-level analytics', ar: 'الوصول إلى تحليلات شاملة على مستوى القطاع' } },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{t(item.title)}</div>
                    <div className="text-sm text-muted-foreground">{t(item.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">
              {t({ en: "You're All Set!", ar: 'أنت جاهز!' })}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t({
                en: 'Your deputyship profile is complete. You can now access your executive dashboard to oversee innovation across municipalities.',
                ar: 'تم إكمال ملف الوكالة الخاص بك. يمكنك الآن الوصول إلى لوحة التحكم التنفيذية للإشراف على الابتكار عبر البلديات.'
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">{t({ en: 'Deputyship Onboarding', ar: 'تأهيل الوكالة' })}</Badge>
            <span className="text-sm text-muted-foreground">
              {t({ en: `Step ${currentStep + 1} of ${STEPS.length}`, ar: `الخطوة ${currentStep + 1} من ${STEPS.length}` })}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, idx) => (
              <span
                key={step.id}
                className={`text-xs ${idx <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t(step.title)}
              </span>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>

        <CardFooter className="border-t pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ en: 'Previous', ar: 'السابق' })}
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleComplete} disabled={updateProfile.isPending}>
              {t({ en: 'Go to Dashboard', ar: 'انتقل للوحة التحكم' })}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {t({ en: 'Next', ar: 'التالي' })}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
