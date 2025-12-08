import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function OnboardingWizard({ user, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    bio: '',
    title: '',
    expertise: [],
    interests: [],
    organization: '',
    preferences: {}
  });

  const steps = [
    { title: { en: 'Welcome', ar: 'مرحباً' }, icon: '👋' },
    { title: { en: 'Profile', ar: 'الملف' }, icon: '🧑' },
    { title: { en: 'Expertise', ar: 'الخبرة' }, icon: '🎯' },
    { title: { en: 'Preferences', ar: 'التفضيلات' }, icon: '⚙️' }
  ];

  const progress = (step / steps.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t({ en: 'Step', ar: 'الخطوة' })} {step}/{steps.length}</span>
          <span className="text-slate-600">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${
              i + 1 === step ? 'bg-blue-600 text-white' :
              i + 1 < step ? 'bg-green-600 text-white' :
              'bg-slate-200 text-slate-600'
            }`}>
              {i + 1 < step ? <CheckCircle2 className="h-6 w-6" /> : s.icon}
            </div>
            <p className="text-xs mt-2 font-medium">{s.title[language]}</p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-3xl font-bold">{t({ en: 'Welcome to Saudi Innovates!', ar: 'مرحباً في الابتكار السعودي!' })}</h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                {t({ 
                  en: "Let's set up your profile to connect you with the right challenges, programs, and opportunities.",
                  ar: 'دعنا نعد ملفك الشخصي لربطك بالتحديات والبرامج والفرص المناسبة.'
                })}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Title/Position', ar: 'المسمى الوظيفي' })}</label>
                <Input
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder={t({ en: 'e.g., Innovation Manager', ar: 'مثال: مدير الابتكار' })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Organization', ar: 'المنظمة' })}</label>
                <Input
                  value={data.organization}
                  onChange={(e) => setData({ ...data, organization: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Bio', ar: 'السيرة' })}</label>
                <Textarea
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  rows={4}
                  placeholder={t({ en: 'Tell us about yourself...', ar: 'أخبرنا عن نفسك...' })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Areas of Expertise', ar: 'مجالات الخبرة' })}</label>
                <Input placeholder={t({ en: 'e.g., Urban Planning, AI, Sustainability', ar: 'مثال: التخطيط الحضري، الذكاء الاصطناعي' })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Interests', ar: 'الاهتمامات' })}</label>
                <Input placeholder={t({ en: 'Topics you want to follow', ar: 'المواضيع التي تريد متابعتها' })} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold">{t({ en: "You're all set!", ar: 'أنت جاهز!' })}</h2>
              <p className="text-slate-600">
                {t({ en: 'Your profile is complete. Start exploring opportunities!', ar: 'ملفك مكتمل. ابدأ باستكشاف الفرص!' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Back', ar: 'رجوع' })}
        </Button>
        <Button
          onClick={() => {
            if (step === steps.length) {
              onComplete?.(data);
            } else {
              setStep(step + 1);
            }
          }}
          className="bg-blue-600"
        >
          {step === steps.length ? t({ en: 'Finish', ar: 'إنهاء' }) : t({ en: 'Next', ar: 'التالي' })}
          {step !== steps.length && <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
        </Button>
      </div>
    </div>
  );
}