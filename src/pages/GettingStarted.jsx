import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, Circle, Rocket, Users, Microscope, Calendar, Building2, PlayCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function GettingStarted() {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (userProfile?.id) {
        const { error } = await supabase
          .from('user_profiles')
          .update(data)
          .eq('id', userProfile.id);
        if (error) throw error;
      } else if (user?.email) {
        const { error } = await supabase
          .from('user_profiles')
          .insert({ ...data, user_email: user.email });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
    }
  });

  const completeStep = (step) => {
    const current = userProfile?.onboarding_progress || {};
    updateProgressMutation.mutate({
      onboarding_progress: { ...current, [step]: true }
    });
  };

  const roleSteps = {
    municipality: [
      { id: 'profile', title: { en: 'Complete Your Profile', ar: 'أكمل ملفك' }, link: 'UserProfile', time: 5 },
      { id: 'challenge', title: { en: 'Submit Your First Challenge', ar: 'قدم تحديك الأول' }, link: 'ChallengeCreate', time: 10 },
      { id: 'solutions', title: { en: 'Explore Solution Marketplace', ar: 'استكشف سوق الحلول' }, link: 'Solutions', time: 5 },
      { id: 'pilot', title: { en: 'Design Your First Pilot', ar: 'صمم تجربتك الأولى' }, link: 'PilotCreate', time: 15 },
    ],
    startup: [
      { id: 'profile', title: { en: 'Complete Company Profile', ar: 'أكمل ملف الشركة' }, link: 'StartupProfile', time: 10 },
      { id: 'solution', title: { en: 'Add Your Solution', ar: 'أضف حلك' }, link: 'SolutionCreate', time: 10 },
      { id: 'matchmaker', title: { en: 'Apply to Matchmaker', ar: 'تقدم للتوفيق' }, link: 'MatchmakerApplicationCreate', time: 15 },
      { id: 'challenges', title: { en: 'Browse Challenge Opportunities', ar: 'تصفح فرص التحديات' }, link: 'Challenges', time: 5 },
    ],
    researcher: [
      { id: 'profile', title: { en: 'Complete Research Profile', ar: 'أكمل ملف البحث' }, link: 'ResearcherProfile', time: 10 },
      { id: 'rdcalls', title: { en: 'Explore R&D Calls', ar: 'استكشف دعوات البحث' }, link: 'RDCalls', time: 5 },
      { id: 'proposal', title: { en: 'Submit Research Proposal', ar: 'قدم مقترح بحث' }, link: 'ProposalWizard', time: 20 },
      { id: 'labs', title: { en: 'Explore Living Labs', ar: 'استكشف المختبرات الحية' }, link: 'LivingLabs', time: 5 },
    ],
    admin: [
      { id: 'users', title: { en: 'Invite Team Members', ar: 'دعوة أعضاء الفريق' }, link: 'UserInvitationManager', time: 5 },
      { id: 'config', title: { en: 'Configure System Settings', ar: 'تكوين إعدادات النظام' }, link: 'SystemDefaultsConfig', time: 10 },
      { id: 'review', title: { en: 'Review Pending Submissions', ar: 'مراجعة التقديمات المعلقة' }, link: 'Approvals', time: 15 },
      { id: 'reports', title: { en: 'Generate First Report', ar: 'إنشاء أول تقرير' }, link: 'ReportsBuilder', time: 10 },
    ]
  };

  const userRole = user?.role === 'admin' ? 'admin' : 'municipality';
  const steps = roleSteps[userRole] || roleSteps.municipality;
  const progress = userProfile?.onboarding_progress || {};
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Getting Started', ar: 'البدء' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Complete these steps to get the most out of the platform', ar: 'أكمل هذه الخطوات للاستفادة القصوى من المنصة' })}
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-blue-900">
                {completedCount}/{steps.length} {t({ en: 'Steps Completed', ar: 'خطوات مكتملة' })}
              </h3>
              <p className="text-sm text-slate-600">
                {t({ en: `You're ${progressPercent}% done with onboarding`, ar: `أنت ${progressPercent}% منجز من التأهيل` })}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{progressPercent}%</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = progress[step.id];
          return (
            <Card key={step.id} className={isComplete ? 'border-2 border-green-300 bg-green-50' : 'border-2'}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <Circle className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {t({ en: `Step ${index + 1}`, ar: `الخطوة ${index + 1}` })}: {step.title[language]}
                      </h3>
                      {!isComplete && (
                        <Badge variant="outline">~{step.time} {t({ en: 'min', ar: 'دقيقة' })}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link to={createPageUrl(step.link)}>
                        <Button size="sm" className={isComplete ? 'bg-green-600' : 'bg-blue-600'}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {isComplete ? t({ en: 'Review', ar: 'مراجعة' }) : t({ en: 'Start', ar: 'ابدأ' })}
                        </Button>
                      </Link>
                      {!isComplete && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completeStep(step.id)}
                        >
                          {t({ en: 'Mark Complete', ar: 'تحديد كمكتمل' })}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Video Tutorials */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Video Tutorials', ar: 'دروس الفيديو' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="aspect-video bg-slate-200 rounded mb-3 flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h4 className="font-medium text-slate-900">{t({ en: 'Platform Overview (3 min)', ar: 'نظرة عامة على المنصة (3 دقائق)' })}</h4>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="aspect-video bg-slate-200 rounded mb-3 flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h4 className="font-medium text-slate-900">{t({ en: 'How to Submit a Challenge (5 min)', ar: 'كيفية تقديم تحدي (5 دقائق)' })}</h4>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(GettingStarted, { requiredPermissions: [] });