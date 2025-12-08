import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Network, Wrench, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function LivingLabInfrastructureWizard({ livingLab, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
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

  const updateMutation = useMutation({
    mutationFn: async (updateData) => {
      await base44.entities.LivingLab.update(livingLab.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Infrastructure setup completed', ar: 'تم إكمال إعداد البنية التحتية' }));
      onClose();
    }
  });

  const completedItems = checklist.filter(item => data[item.key]).length;
  const progress = (completedItems / checklist.length) * 100;

  const handleComplete = () => {
    updateMutation.mutate({
      infrastructure_status: progress === 100 ? 'ready' : 'partial',
      infrastructure_setup: data
    });
  };

  return (
    <Card className="w-full">
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
              const Icon = item.icon;
              const checked = data[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => setData({ ...data, [item.key]: !checked })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    checked 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                      checked 
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
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {updateMutation.isPending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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