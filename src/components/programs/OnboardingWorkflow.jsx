import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Rocket, CheckCircle2, Mail, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingWorkflow({ participant, program }) {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [checklist, setChecklist] = useState({
    welcome_email_sent: false,
    profile_completed: false,
    orientation_attended: false,
    tools_access_granted: false,
    mentor_introduced: false,
    cohort_connected: false
  });

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ProgramApplication.update(participant.id, {
        onboarding_status: 'completed',
        onboarding_completed_date: new Date().toISOString(),
        onboarding_checklist: checklist
      });

      await base44.integrations.Core.SendEmail({
        to: participant.applicant_email,
        subject: `Welcome to ${program.name_en}!`,
        body: `Dear ${participant.applicant_name},

Congratulations on your acceptance to ${program.name_en}!

Your onboarding is now complete. Here's what's next:

📅 Program Start: ${program.timeline?.program_start}
⏰ Duration: ${program.duration_weeks} weeks
👥 Cohort Size: ${program.accepted_count} participants

Next Steps:
1. Join the program kickoff session
2. Access the curriculum and resources
3. Connect with your mentor
4. Collaborate with peers

We're excited to have you!

Best regards,
${program.operator_organization_id || 'Program Team'}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program-applications']);
      toast.success(t({ en: 'Onboarding completed', ar: 'الإعداد مكتمل' }));
    }
  });

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
                  onCheckedChange={(checked) => setChecklist({...checklist, [item.key]: checked})}
                />
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="text-sm flex-1">{item.label[language] || item.label.en}</span>
                {checklist[item.key] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => onboardingMutation.mutate()}
          disabled={!allComplete || onboardingMutation.isPending}
          className="w-full bg-purple-600"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {t({ en: 'Complete Onboarding & Send Welcome', ar: 'إكمال الإعداد وإرسال الترحيب' })}
        </Button>
      </CardContent>
    </Card>
  );
}