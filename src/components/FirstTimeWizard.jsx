import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Building2, Rocket, Microscope, Target, ArrowRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FirstTimeWizard({ user, userProfile, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    organizationType: null,
    goals: []
  });
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (data) => {
      if (userProfile?.id) {
        return base44.entities.UserProfile.update(userProfile.id, data);
      } else {
        return base44.entities.UserProfile.create({ ...data, user_email: user?.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      onComplete?.();
    }
  });

  const orgTypes = [
    { id: 'municipality', label: { en: 'Municipality / Agency', ar: 'بلدية / جهة' }, icon: Building2, color: 'blue' },
    { id: 'startup', label: { en: 'Startup / Company', ar: 'شركة ناشئة' }, icon: Rocket, color: 'purple' },
    { id: 'university', label: { en: 'University / Research', ar: 'جامعة / بحث' }, icon: Microscope, color: 'green' },
  ];

  const goalOptions = [
    { id: 'challenges', label: { en: 'Submit Challenges', ar: 'تقديم التحديات' } },
    { id: 'solutions', label: { en: 'Find Solutions', ar: 'إيجاد الحلول' } },
    { id: 'pilots', label: { en: 'Launch Pilots', ar: 'إطلاق التجارب' } },
    { id: 'rd', label: { en: 'Conduct R&D', ar: 'إجراء البحث' } },
    { id: 'programs', label: { en: 'Run Programs', ar: 'تشغيل البرامج' } },
  ];

  const handleComplete = () => {
    completeMutation.mutate({
      onboarding_progress: {
        completed: true,
        organization_type: selections.organizationType,
        selected_goals: selections.goals,
        completed_date: new Date().toISOString()
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 1 && t({ en: '👋 Welcome to Saudi Innovates!', ar: '👋 مرحباً في الابتكار السعودي!' })}
            {step === 2 && t({ en: '🎯 What are your goals?', ar: '🎯 ما أهدافك؟' })}
            {step === 3 && t({ en: '✨ All set!', ar: '✨ كل شيء جاهز!' })}
          </DialogTitle>
        </DialogHeader>

        <CardContent className="pt-4">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-slate-600 mb-4">
                {t({ en: 'Let\'s get you started in 3 quick steps. First, tell us about your organization:', ar: 'لنبدأ في 3 خطوات سريعة. أولاً، أخبرنا عن منظمتك:' })}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {orgTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selections.organizationType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelections({ ...selections, organizationType: type.id })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? `border-${type.color}-500 bg-${type.color}-50` 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 text-${type.color}-600`} />
                        <span className="font-medium text-slate-900">{type.label[language]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-slate-600 mb-4">
                {t({ en: 'What would you like to accomplish? (Select all that apply)', ar: 'ماذا تريد أن تحقق؟ (اختر كل ما ينطبق)' })}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {goalOptions.map((goal) => {
                  const isSelected = selections.goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelections({ ...selections, goals: selections.goals.filter(g => g !== goal.id) });
                        } else {
                          setSelections({ ...selections, goals: [...selections.goals, goal.id] });
                        }
                      }}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-medium text-slate-900">{goal.label[language]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t({ en: 'You\'re all set!', ar: 'أنت جاهز!' })}
              </h3>
              <p className="text-slate-600">
                {t({ en: 'Start exploring the platform based on your goals', ar: 'ابدأ استكشاف المنصة بناءً على أهدافك' })}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                {t({ en: 'Back', ar: 'السابق' })}
              </Button>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selections.organizationType}
                className="bg-blue-600"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleComplete} className="bg-green-600">
                {t({ en: 'Start Using Platform', ar: 'بدء استخدام المنصة' })}
              </Button>
            )}
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}