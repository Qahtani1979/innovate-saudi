import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Rocket, CheckCircle2, Mail, Users } from 'lucide-react';

import { useOnboardingMutation } from '@/hooks/useOnboarding';

export default function OnboardingWorkflow({ participant, program }) {
  const { t, language } = useLanguage();
  const [checklist, setChecklist] = useState({
    welcome_email_sent: false,
    profile_completed: false,
    orientation_attended: false,
    tools_access_granted: false,
    mentor_introduced: false,
    cohort_connected: false
  });

  const { completeOnboarding } = useOnboardingMutation(program.id);

  const handleCompleteOnboarding = () => {
    completeOnboarding.mutate({
      participantId: participant.id,
      checklist,
      participantEmail: participant.applicant_email,
      participantName: participant.applicant_name,
      programName: program.name_en,
      startDate: program.timeline?.program_start,
      durationWeeks: program.duration_weeks,
      cohortSize: program.accepted_count
    });
  };

  const items = [
    { key: 'welcome_email_sent', label: { en: 'Send welcome email', ar: 'إرسال بريد ترحيبي' }, icon: Mail },
    { key: 'profile_completed', label: { en: 'Participant profile completed', ar: 'ملف المشارك مكتمل' }, icon: Users },
    { key: 'orientation_attended', label: { en: 'Orientation session attended', ar: 'جلسة التوجيه حضرت' }, icon: Rocket },
    { key: 'tools_access_granted', label: { en: 'Tools and platform access granted', ar: 'منح الوصول للأدوات' }, icon: CheckCircle2 },
    { key: 'mentor_introduced', label: { en: 'Introduced to mentor', ar: 'تقديم للموجه' }, icon: Users },
    { key: 'cohort_connected', label: { en: 'Connected with cohort members', ar: 'التواصل مع المجموعة' }, icon: Users }
  ];

  const completedCount = Object.values(checklist).filter(v => v).length;
  const progress = (completedCount / items.length) * 100;
  const allComplete = completedCount === items.length;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-purple-600" />
          {t({ en: 'Participant Onboarding', ar: 'إعداد المشارك' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="font-semibold text-sm mb-2">{participant.applicant_name}</p>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-slate-600">
            {completedCount}/{items.length} {t({ en: 'steps completed', ar: 'خطوات مكتملة' })}
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={checklist[item.key]}
                  onCheckedChange={(checked) => setChecklist({ ...checklist, [item.key]: checked })}
                />
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="text-sm flex-1">{item.label[language] || item.label.en}</span>
                {checklist[item.key] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleCompleteOnboarding}
          disabled={!allComplete || completeOnboarding.isPending}
          className="w-full bg-purple-600"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {t({ en: 'Complete Onboarding & Send Welcome', ar: 'إكمال الإعداد وإرسال الترحيب' })}
        </Button>
      </CardContent>
    </Card>
  );
}
