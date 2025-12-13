import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Rocket, CheckCircle2, X, Loader2, Sparkles, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ProgramLaunchWorkflow({ program, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const launchChecks = [
    { id: 'content_ready', label: { en: 'Curriculum and content finalized', ar: 'المنهج والمحتوى جاهز' }, required: true },
    { id: 'mentors_confirmed', label: { en: 'Mentors confirmed and briefed', ar: 'الموجهون مؤكدون ومطلعون' }, required: true },
    { id: 'platform_ready', label: { en: 'Application platform tested', ar: 'منصة التقديم مختبرة' }, required: true },
    { id: 'communication_plan', label: { en: 'Communication plan approved', ar: 'خطة التواصل موافق عليها' }, required: true },
    { id: 'budget_confirmed', label: { en: 'Budget confirmed and allocated', ar: 'الميزانية مؤكدة ومخصصة' }, required: true },
    { id: 'venues_booked', label: { en: 'Venues/facilities booked', ar: 'الأماكن محجوزة' }, required: false },
    { id: 'partnerships_signed', label: { en: 'Partner agreements signed', ar: 'اتفاقيات الشراكة موقعة' }, required: false }
  ];

  const [checklist, setChecklist] = useState(
    launchChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {})
  );
  const [announcement, setAnnouncement] = useState('');

  const launchMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Program.update(program.id, {
        status: 'applications_open',
        launch_date: new Date().toISOString().split('T')[0],
        launch_checklist: checklist,
        announcement_text: announcement
      });

      // Create notification
      await base44.entities.Notification.create({
        type: 'program_launched',
        title: `New Program: ${program.name_en}`,
        message: announcement || `${program.name_en} is now accepting applications.`,
        severity: 'info',
        link: `/ProgramDetail?id=${program.id}`
      });

      // Send email to all interested parties via email-trigger-hub
      if (program.contact_email) {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.functions.invoke('email-trigger-hub', {
          body: {
            trigger: 'pilot.created',
            recipient_email: program.contact_email,
            entity_type: 'program',
            entity_id: program.id,
            variables: {
              programName: program.name_en,
              announcement: announcement
            },
            triggered_by: 'system'
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program']);
      queryClient.invalidateQueries(['notifications']);
      toast.success(t({ en: 'Program launched successfully', ar: 'تم إطلاق البرنامج بنجاح' }));
      onClose();
    }
  });

  const allRequiredChecked = launchChecks
    .filter(c => c.required)
    .every(c => checklist[c.id]);

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-orange-600" />
          {t({ en: 'Launch Program', ar: 'إطلاق البرنامج' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm font-medium text-orange-900">{program?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">{program?.program_type?.replace(/_/g, ' ')}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Launch Readiness Checklist', ar: 'قائمة جاهزية الإطلاق' })}
          </p>
          {launchChecks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={checklist[check.id]}
                onCheckedChange={(checked) => setChecklist({ ...checklist, [check.id]: checked })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm text-slate-900">{check.label[isRTL ? 'ar' : 'en']}</p>
                {check.required && (
                  <Badge className="bg-red-100 text-red-700 text-xs mt-1">
                    {t({ en: 'Required', ar: 'مطلوب' })}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Launch Announcement', ar: 'إعلان الإطلاق' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Write announcement message for launch...', ar: 'اكتب رسالة الإعلان للإطلاق...' })}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => launchMutation.mutate()}
            disabled={!allRequiredChecked || launchMutation.isPending}
            className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
          >
            {launchMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Launch Program', ar: 'إطلاق البرنامج' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}