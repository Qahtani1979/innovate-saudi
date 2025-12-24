import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Shield, CheckCircle2, X, Loader2, AlertCircle, Wifi, Zap, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxInfrastructureReadinessGate({ sandbox, onClose, onApprove }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const readinessChecks = [
    {
      id: 'physical_space',
      category: 'Physical',
      label: { en: 'Physical test space secured and prepared', ar: 'المساحة الفعلية محجوزة ومجهزة' },
      icon: Shield,
      required: true
    },
    {
      id: 'connectivity',
      category: 'Technical',
      label: { en: 'Network connectivity installed and tested', ar: 'اتصال الشبكة مثبت ومختبر' },
      icon: Wifi,
      required: true
    },
    {
      id: 'power',
      category: 'Technical',
      label: { en: 'Power supply adequate and reliable', ar: 'مصدر الطاقة كافٍ وموثوق' },
      icon: Zap,
      required: true
    },
    {
      id: 'monitoring_hardware',
      category: 'Monitoring',
      label: { en: 'Monitoring sensors and cameras installed', ar: 'أجهزة استشعار ومراقبة مثبتة' },
      icon: Database,
      required: true
    },
    {
      id: 'monitoring_software',
      category: 'Monitoring',
      label: { en: 'Monitoring software configured and tested', ar: 'برنامج المراقبة مجهز ومختبر' },
      icon: Database,
      required: true
    },
    {
      id: 'safety_equipment',
      category: 'Safety',
      label: { en: 'Safety equipment and signage in place', ar: 'معدات السلامة واللافتات جاهزة' },
      icon: Shield,
      required: true
    },
    {
      id: 'access_control',
      category: 'Security',
      label: { en: 'Access control systems operational', ar: 'أنظمة التحكم بالوصول تعمل' },
      icon: Shield,
      required: true
    },
    {
      id: 'emergency_systems',
      category: 'Safety',
      label: { en: 'Emergency response systems tested', ar: 'أنظمة الطوارئ مختبرة' },
      icon: AlertCircle,
      required: true
    },
    {
      id: 'lab_equipment',
      category: 'Equipment',
      label: { en: 'Lab equipment calibrated and ready', ar: 'معدات المختبر معايرة وجاهزة' },
      icon: Shield,
      required: false
    },
    {
      id: 'backup_systems',
      category: 'Technical',
      label: { en: 'Backup and redundancy systems active', ar: 'أنظمة النسخ الاحتياطي نشطة' },
      icon: Database,
      required: false
    }
  ];

  const [checklist, setChecklist] = useState(
    readinessChecks.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  const [inspectorNotes, setInspectorNotes] = useState('');

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase
        .from('sandboxes')
        .update({
          infrastructure_ready: true,
          infrastructure_readiness_date: new Date().toISOString().split('T')[0],
          infrastructure_checklist: checklist,
          infrastructure_notes: inspectorNotes
        })
        .eq('id', sandbox.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sandbox']);
      toast.success(t({ en: 'Infrastructure approved as ready', ar: 'تمت الموافقة على جاهزية البنية التحتية' }));
      if (onApprove) onApprove();
      onClose();
    }
  });

  const allRequiredChecked = readinessChecks
    .filter(item => item.required)
    .every(item => checklist[item.id]);

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const progress = (checkedCount / readinessChecks.length) * 100;

  const groupedChecks = readinessChecks.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'Infrastructure Readiness Gate', ar: 'بوابة جاهزية البنية التحتية' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">{sandbox?.name_en}</p>
            <Badge className="bg-blue-600 text-white">
              {checkedCount}/{readinessChecks.length} {t({ en: 'Ready', ar: 'جاهز' })}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </div>

        {!allRequiredChecked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {t({
                en: 'All required infrastructure items must be checked before approval.',
                ar: 'يجب تحديد جميع عناصر البنية التحتية المطلوبة قبل الموافقة.'
              })}
            </p>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedChecks).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                {category}
              </h4>
              <div className="space-y-2 ml-6">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                      <Checkbox
                        checked={checklist[item.id]}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, [item.id]: checked })
                        }
                        className="mt-0.5"
                      />
                      <Icon className="h-4 w-4 text-slate-400 mt-0.5" />
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Inspector Notes', ar: 'ملاحظات المفتش' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Infrastructure inspection notes...', ar: 'ملاحظات فحص البنية التحتية...' })}
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => approveMutation.mutate()}
            disabled={!allRequiredChecked || approveMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {approveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Approve Infrastructure', ar: 'الموافقة على البنية التحتية' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}