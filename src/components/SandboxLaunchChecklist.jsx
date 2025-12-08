import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Rocket, CheckCircle2, AlertCircle, X, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxLaunchChecklist({ sandbox, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const checklistItems = [
    {
      id: 'infrastructure',
      category: 'Infrastructure',
      label: { en: 'Infrastructure provisioned and tested', ar: 'البنية التحتية مجهزة ومختبرة' },
      required: true
    },
    {
      id: 'regulatory',
      category: 'Regulatory',
      label: { en: 'Regulatory framework approved and documented', ar: 'الإطار التنظيمي موافق عليه وموثق' },
      required: true
    },
    {
      id: 'exemptions',
      category: 'Regulatory',
      label: { en: 'Exemptions defined and legally reviewed', ar: 'الإعفاءات محددة ومراجعة قانونياً' },
      required: true
    },
    {
      id: 'safety',
      category: 'Safety',
      label: { en: 'Safety protocols established', ar: 'بروتوكولات السلامة معتمدة' },
      required: true
    },
    {
      id: 'monitoring',
      category: 'Monitoring',
      label: { en: 'Monitoring systems operational', ar: 'أنظمة المراقبة تعمل' },
      required: true
    },
    {
      id: 'team',
      category: 'Team',
      label: { en: 'Sandbox team trained and ready', ar: 'فريق المنطقة مدرب وجاهز' },
      required: true
    },
    {
      id: 'application_process',
      category: 'Process',
      label: { en: 'Application process documented and published', ar: 'عملية التقديم موثقة ومنشورة' },
      required: true
    },
    {
      id: 'insurance',
      category: 'Legal',
      label: { en: 'Insurance and liability coverage confirmed', ar: 'التأمين وتغطية المسؤولية مؤكدة' },
      required: true
    },
    {
      id: 'public_communication',
      category: 'Communication',
      label: { en: 'Public communication plan ready', ar: 'خطة التواصل العام جاهزة' },
      required: false
    },
    {
      id: 'emergency_procedures',
      category: 'Safety',
      label: { en: 'Emergency response procedures in place', ar: 'إجراءات الطوارئ جاهزة' },
      required: true
    }
  ];

  const [checklist, setChecklist] = useState(
    checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  const [notes, setNotes] = useState('');

  const launchMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Sandbox.update(sandbox.id, {
        status: 'active',
        launch_date: new Date().toISOString().split('T')[0],
        launch_checklist: checklist,
        launch_notes: notes
      });

      // Create notification
      await base44.entities.Notification.create({
        type: 'sandbox_launched',
        title: `Sandbox Launched: ${sandbox.name_en}`,
        message: `${sandbox.name_en} is now active and accepting applications.`,
        severity: 'success',
        link: `/SandboxDetail?id=${sandbox.id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sandbox']);
      queryClient.invalidateQueries(['notifications']);
      toast.success(t({ en: 'Sandbox launched successfully!', ar: 'تم إطلاق المنطقة بنجاح!' }));
      onClose();
    }
  });

  const allRequiredChecked = checklistItems
    .filter(item => item.required)
    .every(item => checklist[item.id]);

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const progress = (checkedCount / checklistItems.length) * 100;

  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-purple-600" />
          {t({ en: 'Sandbox Launch Readiness Checklist', ar: 'قائمة جاهزية إطلاق المنطقة' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-900">{sandbox?.name_en}</p>
            <Badge className="bg-purple-600 text-white">
              {checkedCount}/{checklistItems.length} {t({ en: 'Complete', ar: 'مكتمل' })}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </div>

        {!allRequiredChecked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {t({
                en: 'All required items must be checked before launching the sandbox.',
                ar: 'يجب تحديد جميع العناصر المطلوبة قبل إطلاق المنطقة.'
              })}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                {category}
              </h4>
              <div className="space-y-2 ml-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={checklist[item.id]}
                      onCheckedChange={(checked) => 
                        setChecklist({ ...checklist, [item.id]: checked })
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        {item.label[isRTL ? 'ar' : 'en']}
                      </p>
                      {item.required && (
                        <Badge className="bg-red-100 text-red-700 text-xs mt-1">
                          {t({ en: 'Required', ar: 'مطلوب' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Launch Notes', ar: 'ملاحظات الإطلاق' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Any additional notes or comments...', ar: 'أي ملاحظات أو تعليقات إضافية...' })}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!allRequiredChecked || launchMutation.isPending}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {launchMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            {t({ en: '🚀 Launch Sandbox', ar: '🚀 إطلاق المنطقة' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}