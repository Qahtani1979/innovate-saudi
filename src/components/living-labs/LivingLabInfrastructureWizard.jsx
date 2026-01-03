import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, Network, Wrench, Zap, X, Loader2 } from 'lucide-react';
import { useLivingLabMutations } from '@/hooks/useLivingLab';

export default function LivingLabInfrastructureWizard({ livingLab, onClose }) {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState(1); // Keep step state if needed for future expansion
  const [data, setData] = useState({
    internet_connectivity: false,
    power_backup: false,
    security_systems: false,
    equipment_installed: false,
    software_configured: false,
    safety_protocols: false,
    access_control: false,
    monitoring_systems: false,
    notes: ''
  });

  const { updateLivingLab } = useLivingLabMutations(livingLab.id);

  const checklist = [
    { key: 'internet_connectivity', label: { en: 'High-speed internet connectivity', ar: 'اتصال إنترنت عالي السرعة' }, icon: Network },
    { key: 'power_backup', label: { en: 'Power backup systems', ar: 'أنظمة الطاقة الاحتياطية' }, icon: Zap },
    { key: 'security_systems', label: { en: 'Security & surveillance systems', ar: 'أنظمة الأمن والمراقبة' }, icon: Circle },
    { key: 'equipment_installed', label: { en: 'Lab equipment installed', ar: 'معدات المختبر مثبتة' }, icon: Wrench },
    { key: 'software_configured', label: { en: 'Software tools configured', ar: 'أدوات البرمجيات مكونة' }, icon: Network },
    { key: 'safety_protocols', label: { en: 'Safety protocols in place', ar: 'بروتوكولات السلامة جاهزة' }, icon: CheckCircle2 },
    { key: 'access_control', label: { en: 'Access control systems', ar: 'أنظمة التحكم بالوصول' }, icon: Circle },
    { key: 'monitoring_systems', label: { en: 'Environmental monitoring', ar: 'المراقبة البيئية' }, icon: Network }
  ];

  const completedItems = checklist.filter(item => data[item.key]).length;
  const progress = (completedItems / checklist.length) * 100;

  const handleComplete = () => {
    updateLivingLab.mutate({
      infrastructure_status: progress === 100 ? 'ready' : 'partial',
      infrastructure_setup: data
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Card className="w-full border-2 border-slate-100 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            {t({ en: 'Infrastructure Setup Wizard', ar: 'معالج إعداد البنية التحتية' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{t({ en: 'Setup Progress', ar: 'تقدم الإعداد' })}</p>
            <Badge className={progress === 100 ? 'bg-green-600' : 'bg-blue-600'}>
              {completedItems}/{checklist.length} {t({ en: 'Complete', ar: 'مكتمل' })}
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-slate-500 mt-1">{progress.toFixed(0)}% {t({ en: 'ready', ar: 'جاهز' })}</p>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{t({ en: 'Infrastructure Checklist', ar: 'قائمة البنية التحتية' })}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklist.map((item) => {
              const checked = data[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => setData({ ...data, [item.key]: !checked })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${checked
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${checked
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-slate-300'
                      }`}>
                      {checked && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {t(item.label)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Setup Notes', ar: 'ملاحظات الإعداد' })}
          </label>
          <Textarea
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            rows={3}
            placeholder={t({ en: 'Add notes about infrastructure setup...', ar: 'إضافة ملاحظات عن إعداد البنية...' })}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={updateLivingLab.isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-600 shadow-md hover:shadow-lg transition-all"
          >
            {updateLivingLab.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Complete Setup', ar: 'إكمال الإعداد' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
