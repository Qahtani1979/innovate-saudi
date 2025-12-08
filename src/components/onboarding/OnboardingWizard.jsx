import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import {
  Sparkles, Users, Shield, Calendar, Target, BookOpen, ArrowRight, 
  ArrowLeft, Check, X, Lightbulb, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function OnboardingWizard({ user, onComplete }) {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const updateProgressMutation = useMutation({
    mutationFn: (progress) => base44.auth.updateMe({ onboarding_progress: progress }),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ 
      onboarding_completed: true,
      onboarding_progress: {
        completed_steps: steps.map(s => s.id),
        completed_date: new Date().toISOString()
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      toast.success(t({ en: 'Welcome aboard!', ar: 'مرحباً بك!' }));
      onComplete?.();
    }
  });

  const skipOnboardingMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ 
      onboarding_completed: true,
      onboarding_progress: { skipped: true }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      onComplete?.();
    }
  });

  useEffect(() => {
    if (currentStep === 0 && !aiRecommendations) {
      generateAIRecommendations();
    }
  }, [currentStep]);

  const generateAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an onboarding assistant for the Saudi National Municipal Innovation Platform.

User Profile:
- Name: ${user.full_name}
- Email: ${user.email}
- Role: ${user.role}
- Job Title: ${user.job_title || 'Not specified'}
- Department: ${user.department || 'Not specified'}

Based on this profile, provide personalized onboarding recommendations:
1. Which 3-5 key features should they explore first?
2. Which teams or roles might be most relevant to join?
3. What initial actions should they take (e.g., create first challenge, join a program)?
4. Suggest 2-3 training resources based on their role.

Be specific and actionable.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_features: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  feature: { type: 'string' },
                  reason: { type: 'string' },
                  page: { type: 'string' }
                }
              }
            },
            recommended_teams: {
              type: 'array',
              items: { type: 'string' }
            },
            initial_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            training_resources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setAiRecommendations(result);
    } catch (error) {
      console.error('AI recommendations failed:', error);
    }
    setLoadingAI(false);
  };

  const steps = [
    {
      id: 'welcome',
      title: { en: 'Welcome to Saudi Innovates', ar: 'مرحباً بك في الابتكار السعودي' },
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t({ en: `Welcome, ${user.full_name}!`, ar: `مرحباً، ${user.full_name}!` })}
            </h2>
            <p className="text-slate-600">
              {t({ 
                en: "Let's get you started with a quick tour of the platform", 
                ar: 'دعنا نبدأ بجولة سريعة في المنصة' 
              })}
            </p>
          </div>

          {loadingAI ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-sm text-slate-600">
                {t({ en: 'Personalizing your experience...', ar: 'جاري تخصيص تجربتك...' })}
              </span>
            </div>
          ) : aiRecommendations && (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {t({ en: 'AI Recommendations for You', ar: 'التوصيات الذكية لك' })}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      {t({ en: 'Suggested First Actions:', ar: 'الإجراءات المقترحة:' })}
                    </p>
                    {aiRecommendations.initial_actions?.slice(0, 3).map((action, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{action.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'features',
      title: { en: 'Key Features', ar: 'الميزات الرئيسية' },
      icon: Target,
      content: (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {t({ en: 'Explore What You Can Do', ar: 'استكشف ما يمكنك فعله' })}
          </h3>
          
          {aiRecommendations?.recommended_features ? (
            <div className="grid grid-cols-1 gap-3">
              {aiRecommendations.recommended_features.map((feature, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{feature.feature}</p>
                        <p className="text-sm text-slate-600 mt-1">{feature.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium">{t({ en: 'Manage Teams', ar: 'إدارة الفرق' })}</p>
                  <p className="text-sm text-slate-600">{t({ en: 'Create and organize teams', ar: 'إنشاء وتنظيم الفرق' })}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <Shield className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium">{t({ en: 'Assign Permissions', ar: 'تعيين الصلاحيات' })}</p>
                  <p className="text-sm text-slate-600">{t({ en: 'Configure role-based access', ar: 'ضبط الوصول حسب الدور' })}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'teams',
      title: { en: 'Teams & Collaboration', ar: 'الفرق والتعاون' },
      icon: Users,
      content: (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {t({ en: 'Join Teams to Collaborate', ar: 'انضم للفرق للتعاون' })}
          </h3>
          <p className="text-sm text-slate-600">
            {t({ 
              en: 'Teams allow you to collaborate with colleagues and inherit shared permissions.', 
              ar: 'تتيح لك الفرق التعاون مع الزملاء والحصول على صلاحيات مشتركة.' 
            })}
          </p>

          {aiRecommendations?.recommended_teams?.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  {t({ en: 'Recommended Teams for You', ar: 'الفرق الموصى بها لك' })}
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.recommended_teams.map((team, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge className="bg-green-600">{team}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'training',
      title: { en: 'Training & Resources', ar: 'التدريب والموارد' },
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {t({ en: 'Get Up to Speed', ar: 'ابدأ التعلم' })}
          </h3>

          {aiRecommendations?.training_resources ? (
            <div className="space-y-3">
              {aiRecommendations.training_resources.map((resource, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">{resource.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {t({ en: 'Training resources will be recommended based on your role.', ar: 'سيتم التوصية بموارد تدريبية حسب دورك.' })}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'complete',
      title: { en: 'All Set!', ar: 'كل شيء جاهز!' },
      icon: Check,
      content: (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-600 to-teal-500 mb-4">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">
            {t({ en: "You're Ready to Go!", ar: 'أنت جاهز للبدء!' })}
          </h2>
          <p className="text-slate-600">
            {t({ 
              en: 'Start exploring the platform and drive innovation forward.', 
              ar: 'ابدأ استكشاف المنصة وقيادة الابتكار.' 
            })}
          </p>

          {aiRecommendations?.initial_actions?.length > 0 && (
            <Card className="text-left">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">
                  {t({ en: 'Your Next Steps:', ar: 'خطواتك التالية:' })}
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.initial_actions.slice(0, 5).map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-slate-600">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }
  ];

  const handleNext = () => {
    const completedSteps = [...(user.onboarding_progress?.completed_steps || []), steps[currentStep].id];
    updateProgressMutation.mutate({ completed_steps: completedSteps });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboardingMutation.mutate();
    }
  };

  const handleSkip = () => {
    skipOnboardingMutation.mutate();
  };

  const StepIcon = steps[currentStep].icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                <StepIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{steps[currentStep].title[language]}</h3>
                <p className="text-sm text-slate-500">
                  {t({ en: `Step ${currentStep + 1} of ${steps.length}`, ar: `خطوة ${currentStep + 1} من ${steps.length}` })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Progress value={progress} className="mb-6" />

          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Back', ar: 'السابق' })}
            </Button>

            <Button onClick={handleNext} className="bg-gradient-to-r from-blue-600 to-teal-600">
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
                </>
              ) : (
                <>
                  {t({ en: 'Next', ar: 'التالي' })}
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}