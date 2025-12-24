import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Rocket, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LivingLabLaunchChecklist({ lab, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const launchChecks = [
    { id: 'infrastructure_ready', label: { en: 'Infrastructure and equipment operational', ar: 'البنية التحتية والمعدات جاهزة' }, required: true },
    { id: 'safety_certified', label: { en: 'Safety protocols certified', ar: 'بروتوكولات السلامة معتمدة' }, required: true },
    { id: 'staff_trained', label: { en: 'Staff trained and ready', ar: 'الموظفون مدربون وجاهزون' }, required: true },
    { id: 'booking_system_active', label: { en: 'Booking system activated', ar: 'نظام الحجز مفعل' }, required: true },
    { id: 'access_policies_set', label: { en: 'Access policies documented', ar: 'سياسات الوصول موثقة' }, required: true },
    { id: 'partnerships_signed', label: { en: 'University/research partnerships signed', ar: 'شراكات الجامعات موقعة' }, required: false },
    { id: 'expert_network_ready', label: { en: 'Expert network established', ar: 'شبكة الخبراء منشأة' }, required: false },
    { id: 'datasets_cataloged', label: { en: 'Datasets cataloged and accessible', ar: 'مجموعات البيانات مفهرسة' }, required: false },
    { id: 'connectivity_tested', label: { en: 'Network connectivity tested', ar: 'الاتصال بالشبكة مختبر' }, required: true },
    { id: 'announcement_ready', label: { en: 'Launch announcement prepared', ar: 'إعلان الإطلاق جاهز' }, required: true }
  ];

  const [checklist, setChecklist] = useState(
    launchChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {})
  );
  const [launchNotes, setLaunchNotes] = useState('');

  const launchMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.LivingLab.update(lab.id, {
        status: 'operational',
        launch_date: new Date().toISOString().split('T')[0],
        launch_checklist: checklist,
        launch_notes: launchNotes
      });

      await base44.entities.Notification.create({
        type: 'livinglab_launched',
        title: `Living Lab Launched: ${lab.name_en}`,
        message: `${lab.name_en} is now operational and accepting research projects.`,
        severity: 'success',
        link: `/LivingLabDetail?id=${lab.id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Living Lab launched successfully', ar: 'تم إطلاق المختبر بنجاح' }));
      onClose();
    }
  });

  const allRequiredChecked = launchChecks
    .filter(c => c.required)
    .every(c => checklist[c.id]);

  const progress = (Object.values(checklist).filter(Boolean).length / launchChecks.length) * 100;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-teal-600" />
          {t({ en: 'Launch Living Lab', ar: 'إطلاق المختبر الحي' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-sm font-medium text-teal-900">{lab?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">{lab?.type}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-teal-900">Launch Readiness</p>
            <Badge className="bg-teal-600 text-white">
              {Object.values(checklist).filter(Boolean).length}/{launchChecks.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
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
            {t({ en: 'Launch Notes', ar: 'ملاحظات الإطلاق' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Any special notes about the launch...', ar: 'أي ملاحظات خاصة عن الإطلاق...' })}
            value={launchNotes}
            onChange={(e) => setLaunchNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => launchMutation.mutate()}
            disabled={!allRequiredChecked || launchMutation.isPending}
            className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            {launchMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Launch Lab', ar: 'إطلاق المختبر' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}