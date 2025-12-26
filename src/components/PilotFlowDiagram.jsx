import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import {
  FileText,
  Send,
  CheckCircle2,
  Activity,
  Shield,
  Rocket,
  BarChart3,
  Award,
  TrendingUp,
  XCircle,
  RotateCcw,
  Pause,
  Flag,
  DollarSign
} from 'lucide-react';

function PilotFlowDiagram() {
  const { language, isRTL, t } = useLanguage();

  const stages = [
    { id: 'design', label: { en: 'Design', ar: 'التصميم' }, icon: FileText, color: 'bg-slate-600' },
    { id: 'submission', label: { en: 'Submission Gate', ar: 'بوابة التقديم' }, icon: Send, color: 'bg-blue-600', gate: true },
    { id: 'approval_pending', label: { en: 'Approval Pending', ar: 'قيد الموافقة' }, icon: Activity, color: 'bg-yellow-600' },
    { id: 'approval_gate', label: { en: 'Approval Gate', ar: 'بوابة الموافقة' }, icon: CheckCircle2, color: 'bg-green-600', gate: true },
    { id: 'approved', label: { en: 'Approved', ar: 'موافق عليه' }, icon: CheckCircle2, color: 'bg-blue-600' },
    { id: 'prep_gate', label: { en: 'Preparation Gate', ar: 'بوابة التحضير' }, icon: Activity, color: 'bg-purple-600', gate: true },
    { id: 'preparation', label: { en: 'Preparation', ar: 'التحضير' }, icon: Activity, color: 'bg-purple-600' },
    { id: 'compliance_gate', label: { en: 'Compliance Gate', ar: 'بوابة الامتثال' }, icon: Shield, color: 'bg-blue-600', gate: true },
    { id: 'launch_gate', label: { en: 'Launch Gate', ar: 'بوابة الإطلاق' }, icon: Rocket, color: 'bg-green-600', gate: true },
    { id: 'active', label: { en: 'Active', ar: 'نشط' }, icon: Activity, color: 'bg-green-600' },
    { id: 'monitoring', label: { en: 'Monitoring', ar: 'المراقبة' }, icon: BarChart3, color: 'bg-teal-600' },
    { id: 'eval_gate', label: { en: 'Evaluation Gate', ar: 'بوابة التقييم' }, icon: Award, color: 'bg-amber-600', gate: true },
    { id: 'evaluation', label: { en: 'Evaluation', ar: 'التقييم' }, icon: Award, color: 'bg-amber-600' },
    { id: 'completed', label: { en: 'Completed', ar: 'مكتمل' }, icon: CheckCircle2, color: 'bg-green-600' },
    { id: 'scaling_gate', label: { en: 'Scaling Gate', ar: 'بوابة التوسع' }, icon: TrendingUp, color: 'bg-teal-600', gate: true },
    { id: 'scaled', label: { en: 'Scaled', ar: 'تم التوسع' }, icon: TrendingUp, color: 'bg-blue-600' }
  ];

  const exceptions = [
    { id: 'hold', label: { en: 'On Hold', ar: 'متوقف' }, icon: Pause, color: 'bg-orange-600' },
    { id: 'pivot', label: { en: 'Pivot', ar: 'تغيير' }, icon: RotateCcw, color: 'bg-amber-600' },
    { id: 'terminated', label: { en: 'Terminated', ar: 'منهي' }, icon: XCircle, color: 'bg-red-600' }
  ];

  const continuousGates = [
    { id: 'milestone', label: { en: 'Milestone Gates', ar: 'بوابات المعالم' }, icon: Flag, color: 'bg-indigo-600' },
    { id: 'budget', label: { en: 'Budget Gates', ar: 'بوابات الميزانية' }, icon: DollarSign, color: 'bg-green-600' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <h3 className="font-bold text-lg text-blue-900 mb-4">
          {t({ en: 'Standard Pilot Flow', ar: 'التدفق القياسي للتجربة' })}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center">
                  <div className={`${stage.color} text-white rounded-lg p-3 ${stage.gate ? 'border-4 border-yellow-400' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-slate-700 mt-1 text-center max-w-[80px]">
                    {stage.label[language]}
                  </p>
                  {stage.gate && (
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs mt-1">GATE</Badge>
                  )}
                </div>
                {i < stages.length - 1 && (
                  <div className="h-0.5 w-4 bg-slate-300" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
          <h3 className="font-bold text-lg text-amber-900 mb-4">
            {t({ en: 'Exception Workflows', ar: 'سير العمل الاستثنائي' })}
          </h3>
          <div className="space-y-3">
            {exceptions.map(exc => {
              const Icon = exc.icon;
              return (
                <div key={exc.id} className="flex items-center gap-3">
                  <div className={`${exc.color} text-white rounded-lg p-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">{exc.label[language]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
          <h3 className="font-bold text-lg text-green-900 mb-4">
            {t({ en: 'Continuous Gates', ar: 'البوابات المستمرة' })}
          </h3>
          <div className="space-y-3">
            {continuousGates.map(gate => {
              const Icon = gate.icon;
              return (
                <div key={gate.id} className="flex items-center gap-3">
                  <div className={`${gate.color} text-white rounded-lg p-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">{gate.label[language]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            {t({ en: 'These gates can be triggered at multiple stages', ar: 'يمكن تفعيل هذه البوابات في مراحل متعددة' })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PilotFlowDiagram;
