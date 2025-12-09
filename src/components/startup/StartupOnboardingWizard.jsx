import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Rocket, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function StartupOnboardingWizard({ onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name_en: '',
    description_en: '',
    stage: 'seed',
    team_size: 5,
    sectors: [],
    challenge_interests: [],
    solution_categories: [],
    geographic_coverage: [],
    website: ''
  });

  const sectorOptions = ['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety'];
  const challengeTypes = ['service_quality', 'infrastructure', 'efficiency', 'innovation', 'safety', 'environmental'];
  const regions = ['riyadh', 'jeddah', 'dammam', 'makkah', 'madinah'];

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      const profile = await base44.entities.StartupProfile.create({
        ...formData,
        user_email: user.email,
        onboarding_completed: true,
        onboarding_date: new Date().toISOString()
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Welcome to Saudi Innovates',
        body: `Welcome ${formData.name_en}! Your startup profile has been created. Start exploring municipal opportunities now.`
      });

      return profile;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries(['startups']);
      toast.success(t({ en: 'Profile created! Welcome aboard!', ar: 'تم إنشاء الملف! مرحباً بك!' }));
      if (onComplete) onComplete(profile);
      navigate(createPageUrl('StartupDashboard'));
    }
  });

  const nextStep = () => {
    if (step === 1 && !formData.name_en) {
      toast.error(t({ en: 'Please enter company name', ar: 'يرجى إدخال اسم الشركة' }));
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  return (
    <div className="max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-orange-600" />
              {t({ en: 'Startup Onboarding', ar: 'تسجيل الشركة' })}
            </CardTitle>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <div
                  key={num}
                  className={`h-2 w-12 rounded ${step >= num ? 'bg-orange-600' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t({ en: 'Step 1: Company Information', ar: 'الخطوة 1: معلومات الشركة' })}</h3>
              
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Company Name', ar: 'اسم الشركة' })}</label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  placeholder={t({ en: 'Enter your startup name', ar: 'أدخل اسم شركتك' })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Description', ar: 'الوصف' })}</label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={4}
                  placeholder={t({ en: 'What does your startup do?', ar: 'ماذا تفعل شركتك؟' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Stage', ar: 'المرحلة' })}</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="idea">Idea</option>
                    <option value="pre_seed">Pre-Seed</option>
                    <option value="seed">Seed</option>
                    <option value="series_a">Series A</option>
                    <option value="growth">Growth</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</label>
                  <Input
                    type="number"
                    value={formData.team_size}
                    onChange={(e) => setFormData({...formData, team_size: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Website (optional)', ar: 'الموقع (اختياري)' })}</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://"
                />
              </div>
            </div>
          )}

          {/* Step 2: Sectors & Expertise */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t({ en: 'Step 2: What sectors do you serve?', ar: 'الخطوة 2: ما القطاعات التي تخدمها؟' })}</h3>
              
              <div className="space-y-2">
                {sectorOptions.map(sector => (
                  <div key={sector} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={formData.sectors.includes(sector)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          sectors: checked 
                            ? [...prev.sectors, sector]
                            : prev.sectors.filter(s => s !== sector)
                        }));
                      }}
                    />
                    <span className="capitalize">{sector.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Challenge Interests */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t({ en: 'Step 3: What types of challenges interest you?', ar: 'الخطوة 3: ما أنواع التحديات التي تهمك؟' })}</h3>
              
              <div className="space-y-2">
                {challengeTypes.map(type => (
                  <div key={type} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={formData.challenge_interests.includes(type)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          challenge_interests: checked 
                            ? [...prev.challenge_interests, type]
                            : prev.challenge_interests.filter(c => c !== type)
                        }));
                      }}
                    />
                    <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Geographic Coverage */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t({ en: 'Step 4: Which regions can you serve?', ar: 'الخطوة 4: أي المناطق يمكنك خدمتها؟' })}</h3>
              
              <div className="space-y-2">
                {regions.map(region => (
                  <div key={region} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={formData.geographic_coverage.includes(region)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          geographic_coverage: checked 
                            ? [...prev.geographic_coverage, region]
                            : prev.geographic_coverage.filter(r => r !== region)
                        }));
                      }}
                    />
                    <span className="capitalize">{region}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-300 mt-6">
                <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Ready to launch!', ar: 'جاهز للإطلاق!' })}
                </p>
                <p className="text-sm text-green-800">
                  {t({ 
                    en: 'You\'ll get AI-matched to relevant municipal challenges and opportunities',
                    ar: 'ستحصل على مطابقة ذكية مع التحديات والفرص البلدية ذات الصلة'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : null}
              disabled={step === 1}
            >
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>

            {step < 4 ? (
              <Button onClick={nextStep} className="bg-orange-600">
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => createProfileMutation.mutate()}
                disabled={createProfileMutation.isPending}
                className="bg-gradient-to-r from-orange-600 to-pink-600"
              >
                {createProfileMutation.isPending ? (
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Complete Onboarding', ar: 'إكمال التسجيل' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}